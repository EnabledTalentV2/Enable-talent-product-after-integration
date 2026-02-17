import { apiRequest, getApiErrorMessage } from "@/lib/api-client";

const TOKEN_WAIT_MS = 20_000;
const SYNC_RETRY_WINDOW_MS = 20_000;
const SYNC_ATTEMPT_TIMEOUT_MS = 10_000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

type SyncCallbacks = {
  getToken: (opts: { template: string; skipCache: boolean }) => Promise<string | null>;
  setSyncPhase: (phase: "token" | "sync" | null) => void;
  setError: (error: string | null) => void;
  setIsRetrying: (retrying: boolean) => void;
  /** Returns the current run ID for cancellation checks */
  getRunId: () => number;
  logLabel: string;
};

const SYNC_FAIL_MESSAGE =
  "Your account was created successfully, but we couldn't connect it to our system. This is usually a temporary issue. You can try again now or log in later — your account is safe.";

export async function syncBackendWithRetry(
  createdUserId: string,
  emailAddress: string,
  callbacks: SyncCallbacks
): Promise<boolean> {
  const { getToken, setSyncPhase, setError, setIsRetrying, getRunId, logLabel } = callbacks;
  const runId = getRunId();

  setIsRetrying(true);
  setSyncPhase("token");
  setError(null);

  let succeeded = false;
  try {
    // Phase 1: Wait for getToken to succeed
    let freshToken: string | null = null;
    const tokenDeadline = Date.now() + TOKEN_WAIT_MS;
    let tokenDelay = 500;

    while (Date.now() < tokenDeadline) {
      if (runId !== getRunId()) return false;
      try {
        freshToken = await getToken({ template: "api", skipCache: true });
        if (freshToken) break;
      } catch (err) {
        console.warn(`[${logLabel}] getToken not ready yet:`, err);
      }
      const remaining = Math.max(0, tokenDeadline - Date.now());
      if (remaining <= 0) break;
      await sleep(Math.min(tokenDelay, remaining));
      tokenDelay = Math.min(Math.round(tokenDelay * 1.5), 3_000);
    }

    if (!freshToken) {
      console.error(`[${logLabel}] Could not obtain Clerk JWT after token wait phase`);
      setError(SYNC_FAIL_MESSAGE);
      return false;
    }

    // Phase 2: Sync with Django backend
    if (runId !== getRunId()) return false;
    setSyncPhase("sync");

    const syncDeadline = Date.now() + SYNC_RETRY_WINDOW_MS;
    let syncDelay = 900;

    while (Date.now() < syncDeadline) {
      if (runId !== getRunId()) return false;

      try {
        const latestToken = await getToken({ template: "api", skipCache: true }) || freshToken;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SYNC_ATTEMPT_TIMEOUT_MS);
        try {
          await apiRequest("/api/auth/clerk-sync", {
            method: "POST",
            body: JSON.stringify({
              clerk_user_id: createdUserId,
              email: emailAddress,
              token: latestToken,
            }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
        succeeded = true;
        return true;
      } catch (err) {
        const remainingMs = Math.max(0, syncDeadline - Date.now());
        console.error(`[${logLabel}] Backend sync attempt failed:`, err);
        if (remainingMs <= 0) break;
        await sleep(Math.min(syncDelay, remainingMs));
        syncDelay = Math.min(Math.round(syncDelay * 1.7), 5_000);
      }
    }

    setError(SYNC_FAIL_MESSAGE);
    return false;
  } finally {
    if (runId === getRunId() && !succeeded) {
      setIsRetrying(false);
      setSyncPhase(null);
    }
  }
}
