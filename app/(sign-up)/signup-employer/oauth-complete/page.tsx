"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { apiRequest, getApiErrorMessage } from "@/lib/api-client";

const SYNC_RETRY_WINDOW_MS = 30_000;
const SYNC_ATTEMPT_TIMEOUT_MS = 10_000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export default function EmployerOAuthCompletePage() {
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
    };
  }, []);

  const syncAccountWithRetry = async () => {
    if (!userId || !email) {
      setIsSyncing(false);
      setError(
        "Unable to complete OAuth signup because your account email is missing.",
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

        setSuccessMessage("Account synced. Redirecting...");
        router.replace("/signup-employer/organisation-info");
        return;
      } catch (syncError) {
        const remainingMs = Math.max(0, deadline - Date.now());
        const remainingSec = Math.ceil(remainingMs / 1000);
        console.error(
          "[signup-employer/oauth-complete] Account sync failed:",
          syncError,
        );
        setError(
          `${getApiErrorMessage(
            syncError,
            "Account sync failed.",
          )} Retrying automatically for up to ${remainingSec}s...`,
        );
        if (remainingMs <= 0) break;
        await sleep(Math.min(delayMs, remainingMs));
        delayMs = Math.min(Math.round(delayMs * 1.7), 5_000);
      }
    }

    if (runId === syncRunIdRef.current) {
      setIsSyncing(false);
      setError(
        "Account sync is taking longer than expected. Please try again in a few minutes.",
      );
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      router.replace("/signup-employer?error=account_incomplete");
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
      console.error(
        "[signup-employer/oauth-complete] Sign out failed:",
        signOutError,
      );
    } finally {
      router.replace("/signup-employer");
    }
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#F0F5FA] px-6 py-12"
      aria-busy={isSyncing}
    >
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Completing Employer OAuth Signup
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          We&apos;re syncing your account so you can finish employer onboarding.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {isSyncing ? (
            <div className="text-slate-700">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                <span>
                  Syncing account with backend
                  {attemptCount ? ` (attempt ${attemptCount})` : ""}...
                </span>
              </div>
              {error ? (
                <p className="mt-2 text-sm text-slate-600">{error}</p>
              ) : null}
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                Cancel and sign out
              </button>
            </div>
          ) : successMessage ? (
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              <span>{successMessage}</span>
            </div>
          ) : (
            <div className="flex items-start gap-3 text-red-700" role="alert">
              <AlertCircle className="mt-0.5 h-5 w-5" aria-hidden="true" />
              <div>
                <p className="font-semibold">Account sync failed</p>
                <p className="mt-1 text-sm text-red-700">
                  {error || "Please try again."}
                </p>
              </div>
            </div>
          )}
        </div>

        {!isSyncing && !successMessage ? (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleRetry}
              className="w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Try syncing again
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              Sign out and try again
            </button>
            <p className="text-center text-xs text-slate-500">
              Already have an employer account?{" "}
              <Link
                href="/login-employer"
                className="font-semibold text-[#B45309] hover:underline"
              >
                Go to Employer Login
              </Link>
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
