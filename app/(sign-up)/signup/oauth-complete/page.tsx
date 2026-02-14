"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { CheckCircle2, Loader2 } from "lucide-react";
import { apiRequest, getApiErrorMessage } from "@/lib/api-client";

const SYNC_RETRY_WINDOW_MS = 30_000;
const SYNC_ATTEMPT_TIMEOUT_MS = 10_000;

const toFriendlySyncError = (err: unknown) => {
  if (err instanceof Error && err.name === "AbortError") {
    return "This request timed out.";
  }
  const message = getApiErrorMessage(err, "Account sync failed.");
  if (/failed to fetch/i.test(message)) {
    return "We couldn't reach the server.";
  }
  return message;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export default function OAuthSignupCompletePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId, signOut } = useAuth();
  const { user } = useUser();

  const [isSyncing, setIsSyncing] = useState(true);
  const [attemptCount, setAttemptCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const hasStartedInitialSync = useRef(false);
  const syncRunIdRef = useRef(0);

  const email = useMemo(
    () =>
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "",
    [user],
  );

  useEffect(() => {
    return () => {
      // Cancel any in-flight sync loop so it won't set state after unmount.
      syncRunIdRef.current += 1;
      // Allow sync to restart on remount (React 18 strict mode double-mounts).
      hasStartedInitialSync.current = false;
    };
  }, []);

  const syncAccountWithRetry = async () => {
    if (!userId || !email) {
      setIsSyncing(false);
      setError(
        "Unable to complete signup because your account email is missing.",
      );
      return;
    }

    const runId = (syncRunIdRef.current += 1);
    const deadline = Date.now() + SYNC_RETRY_WINDOW_MS;
    let delayMs = 900;
    let attempt = 0;

    setIsSyncing(true);
    setAttemptCount(0);
    setError(null);
    setSuccessMessage(null);

    while (Date.now() < deadline) {
      if (runId !== syncRunIdRef.current) return;
      attempt += 1;
      setAttemptCount(attempt);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          SYNC_ATTEMPT_TIMEOUT_MS,
        );
        try {
        await apiRequest("/api/auth/clerk-sync", {
          method: "POST",
          body: JSON.stringify({
            clerk_user_id: userId,
            email,
          }),
            signal: controller.signal,
        });
        } finally {
          clearTimeout(timeoutId);
        }

        const firstName = user?.firstName?.trim() ?? "";
        const lastName = user?.lastName?.trim() ?? "";
        if (firstName || lastName) {
          try {
            await apiRequest("/api/users/profile/", {
              method: "PATCH",
              body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
              }),
            });
          } catch (profileError) {
            console.error(
              "[signup/oauth-complete] Failed to patch profile names:",
              profileError,
            );
          }
        }

        setSuccessMessage("Account synced. Redirecting...");
        router.replace("/signup/resume-upload");
        return;
      } catch (syncError) {
        const remainingMs = Math.max(0, deadline - Date.now());
        const remainingSec = Math.ceil(remainingMs / 1000);
        console.error("[signup/oauth-complete] Account sync failed:", syncError);
        setError(
          `${toFriendlySyncError(syncError)} Retrying automatically for up to ${remainingSec}s...`,
        );
        if (remainingMs <= 0) break;
        await sleep(Math.min(delayMs, remainingMs));
        delayMs = Math.min(Math.round(delayMs * 1.7), 5_000);
      }
    }

    if (runId === syncRunIdRef.current) {
      setIsSyncing(false);
      setError(
        "Your account was created successfully, but we couldn't connect it to our system. This is usually a temporary issue. You can try again now or log in later — your account is safe.",
      );
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      router.replace("/signup?error=account_incomplete");
      return;
    }

    if (hasStartedInitialSync.current) return;
    hasStartedInitialSync.current = true;
    void syncAccountWithRetry();
  }, [isLoaded, isSignedIn, userId, router, email]);

  const handleRetry = async () => {
    await syncAccountWithRetry();
  };

  const handleSignOut = async () => {
    // Cancel any in-flight retry loop before signing out.
    syncRunIdRef.current += 1;
    try {
      await signOut();
    } catch (signOutError) {
      console.error("[signup/oauth-complete] Sign out failed:", signOutError);
    } finally {
      router.replace("/signup");
    }
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#F0F5FA] px-6 py-12"
      aria-busy={isSyncing}
    >
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-semibold text-slate-900">
            {isSyncing ? "Completing signup" : successMessage ? "Completing signup" : "Almost there"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isSyncing
              ? "We're connecting your account. This can take up to 30 seconds."
              : successMessage
                ? "We're syncing your account so you can continue to resume upload."
                : "Your account was created. We just need to finish connecting it to our system."}
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className={`mb-4 rounded-lg border p-3 text-sm ${
              isSyncing
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <p className="font-semibold">{isSyncing ? "Syncing..." : "Setup incomplete"}</p>
            <p className="mt-1 whitespace-pre-wrap">{error}</p>
          </div>
        ) : null}

        {successMessage ? (
          <div className="flex items-center justify-center gap-3 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        <div className="space-y-3">
          {isSyncing ? (
            <>
              <button
                type="button"
                disabled
                className="w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-3 text-sm font-semibold text-white shadow-md opacity-80"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting account{attemptCount ? ` (attempt ${attemptCount})` : ""}...
                </span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full rounded-lg border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                Cancel and sign out
              </button>
            </>
          ) : !successMessage ? (
            <>
              <button
                type="button"
                onClick={handleRetry}
                className="w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full rounded-lg border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                Go to login instead
              </button>
              <p className="text-center text-xs text-slate-500">
                Don&apos;t worry — your account is safe. You can log in anytime to complete setup.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
