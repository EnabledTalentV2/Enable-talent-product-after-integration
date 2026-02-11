"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { apiRequest, getApiErrorMessage } from "@/lib/api-client";

const MAX_SYNC_ATTEMPTS = 5;

export default function OAuthSignupCompletePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId, signOut } = useAuth();
  const { user } = useUser();

  const [isSyncing, setIsSyncing] = useState(true);
  const [attemptCount, setAttemptCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const hasStartedInitialSync = useRef(false);

  const email = useMemo(
    () =>
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "",
    [user]
  );

  const syncAccount = async () => {
    if (!userId || !email) {
      setIsSyncing(false);
      setError(
        "Unable to complete OAuth signup because your account email is missing."
      );
      return;
    }

    setIsSyncing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await apiRequest("/api/auth/clerk-sync", {
        method: "POST",
        body: JSON.stringify({
          clerk_user_id: userId,
          email,
        }),
      });

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
            profileError
          );
        }
      }

      setSuccessMessage("Account synced. Redirecting...");
      router.replace("/signup/resume-upload");
    } catch (syncError) {
      setIsSyncing(false);
      setError(
        getApiErrorMessage(
          syncError,
          "Account sync failed. Please try again."
        )
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
    void syncAccount();
  }, [isLoaded, isSignedIn, userId, router, email]);

  const attemptsRemaining = Math.max(0, MAX_SYNC_ATTEMPTS - attemptCount);
  const canRetry = !isSyncing && attemptsRemaining > 0;

  const handleRetry = async () => {
    if (!canRetry) return;
    setAttemptCount((prev) => prev + 1);
    await syncAccount();
  };

  const handleSignOut = async () => {
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
        <h1 className="text-2xl font-semibold text-slate-900">
          Completing OAuth Signup
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          We&apos;re syncing your account so you can continue to resume upload.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {isSyncing ? (
            <div className="flex items-center gap-3 text-slate-700">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span>Syncing account with backend...</span>
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
              disabled={!canRetry}
              className="w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {canRetry
                ? `Retry Sync (${attemptsRemaining} attempt${
                    attemptsRemaining === 1 ? "" : "s"
                  } left)`
                : "No retries left"}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              Sign out and try again
            </button>
            <p className="text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login-talent"
                className="font-semibold text-[#B45309] hover:underline"
              >
                Go to Talent Login
              </Link>
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

