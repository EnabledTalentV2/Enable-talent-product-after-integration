"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useOAuthComplete } from "@/lib/hooks/useOAuthComplete";

export default function EmployerOAuthCompletePage() {
  const oauth = useOAuthComplete({
    successRedirectPath: "/signup-employer/organisation-info",
    errorRedirectPath: "/signup-employer",
    shouldPatchProfile: false,
    logLabel: "signup-employer/oauth-complete",
  });

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#F0F5FA] px-6 py-12"
      aria-busy={oauth.isSyncing}
    >
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-semibold text-slate-900">
            {oauth.isSyncing ? "Setting up your account" : oauth.successMessage ? "Setting up your account" : "Almost there"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {oauth.isSyncing
              ? oauth.syncPhase === "token"
                ? "Preparing your secure session..."
                : "Connecting your account to our system..."
              : oauth.successMessage
                ? "We're syncing your account so you can continue onboarding."
                : "Your account was created. We just need to finish connecting it to our system."}
          </p>
        </div>

        {oauth.error ? (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
          >
            <p className="font-semibold">Setup incomplete</p>
            <p className="mt-1 whitespace-pre-wrap">{oauth.error}</p>
          </div>
        ) : null}

        {oauth.successMessage ? (
          <div className="flex items-center justify-center gap-3 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <span>{oauth.successMessage}</span>
          </div>
        ) : null}

        <div className="space-y-3">
          {oauth.isSyncing ? (
            <>
              <button
                type="button"
                disabled
                className="w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-3 text-sm font-semibold text-white shadow-md opacity-80"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {oauth.syncPhase === "token"
                    ? "Setting up your account..."
                    : "Connecting to our system..."}
                </span>
              </button>
              <button
                type="button"
                onClick={oauth.handleSignOut}
                className="w-full rounded-lg border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                Cancel and sign out
              </button>
            </>
          ) : !oauth.successMessage ? (
            <>
              <button
                type="button"
                onClick={oauth.handleRetry}
                className="w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={oauth.handleSignOut}
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
