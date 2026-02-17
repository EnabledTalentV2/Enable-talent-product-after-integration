"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { apiRequest, getApiErrorMessage } from "@/lib/api-client";

const TOKEN_WAIT_MS = 20_000; // Phase 1: wait for getToken to succeed
const SYNC_RETRY_WINDOW_MS = 20_000; // Phase 2: sync with Django
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

export interface OAuthCompleteConfig {
  successRedirectPath: string;
  errorRedirectPath: string;
  shouldPatchProfile?: boolean;
  logLabel?: string;
}

export function useOAuthComplete(config: OAuthCompleteConfig) {
  const {
    successRedirectPath,
    errorRedirectPath,
    shouldPatchProfile = true,
    logLabel = "oauth-complete",
  } = config;

  const router = useRouter();
  const { isLoaded, isSignedIn, userId, signOut, getToken } = useAuth();
  const { user } = useUser();

  const [isSyncing, setIsSyncing] = useState(true);
  const [syncPhase, setSyncPhase] = useState<"token" | "sync" | null>("token");
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

  // Cleanup effect
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
      setSyncPhase(null);
      setError(
        "Unable to complete signup because your account email is missing.",
      );
      return;
    }

    const runId = (syncRunIdRef.current += 1);

    setIsSyncing(true);
    setSyncPhase("token");
    setError(null);
    setSuccessMessage(null);

    // ── Phase 1: Wait for getToken to succeed (up to TOKEN_WAIT_MS) ──
    let freshToken: string | null = null;
    const tokenDeadline = Date.now() + TOKEN_WAIT_MS;
    let tokenDelay = 500;

    while (Date.now() < tokenDeadline) {
      if (runId !== syncRunIdRef.current) return;
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
      if (runId === syncRunIdRef.current) {
        console.error(
          `[${logLabel}] Could not obtain Clerk JWT after token wait phase`,
        );
        setIsSyncing(false);
        setSyncPhase(null);
        setError(
          "Your account was created successfully, but we couldn't connect it to our system. This is usually a temporary issue. You can try again now or log in later — your account is safe.",
        );
      }
      return;
    }

    // ── Phase 2: Sync with Django backend (up to SYNC_RETRY_WINDOW_MS) ──
    if (runId !== syncRunIdRef.current) return;
    setSyncPhase("sync");

    const syncDeadline = Date.now() + SYNC_RETRY_WINDOW_MS;
    let syncDelay = 900;

    while (Date.now() < syncDeadline) {
      if (runId !== syncRunIdRef.current) return;

      try {
        const latestToken =
          (await getToken({ template: "api", skipCache: true })) || freshToken;

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
              token: latestToken,
            }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (shouldPatchProfile) {
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
                `[${logLabel}] Failed to patch profile names:`,
                profileError,
              );
            }
          }
        }

        setSuccessMessage("Account synced. Redirecting...");
        router.replace(successRedirectPath);
        return;
      } catch (syncError) {
        const remainingMs = Math.max(0, syncDeadline - Date.now());
        console.error(
          `[${logLabel}] Account sync failed:`,
          syncError,
        );
        if (remainingMs <= 0) break;
        await sleep(Math.min(syncDelay, remainingMs));
        syncDelay = Math.min(Math.round(syncDelay * 1.7), 5_000);
      }
    }

    if (runId === syncRunIdRef.current) {
      setIsSyncing(false);
      setSyncPhase(null);
      setError(
        "Your account was created successfully, but we couldn't connect it to our system. This is usually a temporary issue. You can try again now or log in later — your account is safe.",
      );
    }
  };

  // Initial sync effect
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      router.replace(`${errorRedirectPath}?error=account_incomplete`);
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
      console.error(`[${logLabel}] Sign out failed:`, signOutError);
    } finally {
      router.replace(errorRedirectPath);
    }
  };

  return {
    isSyncing,
    syncPhase,
    error,
    successMessage,
    handleRetry,
    handleSignOut,
  };
}
