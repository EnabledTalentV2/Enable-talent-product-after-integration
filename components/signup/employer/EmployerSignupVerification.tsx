"use client";

import { Loader2 } from "lucide-react";

const inputClasses = (hasError?: boolean) =>
  `w-full h-11 rounded-lg border bg-white px-4 text-sm text-gray-700 transition-shadow placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-gray-200 focus:border-[#C27803] focus:ring-[#C27803]"
  }`;

type EmployerSignupVerificationProps = {
  email: string;
  verificationCode: string;
  isVerifying: boolean;
  serverError: string | null;
  verificationComplete: boolean;
  isRetrying: boolean;
  syncPhase: "token" | "sync" | null;
  resendCooldown: number;
  setVerificationCode: (value: string) => void;
  handleVerification: () => void;
  handleResendCode: () => void;
  handleRetrySyncBackend: () => void;
  handleGoToLogin: () => void;
};

export default function EmployerSignupVerification({
  email,
  verificationCode,
  isVerifying,
  serverError,
  verificationComplete,
  isRetrying,
  syncPhase,
  resendCooldown,
  setVerificationCode,
  handleVerification,
  handleResendCode,
  handleRetrySyncBackend,
  handleGoToLogin,
}: EmployerSignupVerificationProps) {
  if (verificationComplete) {
    return (
      <>
        <div className="text-center mb-7">
          <h2 className="text-[26px] font-semibold text-gray-900 mb-2">
            {isRetrying ? "Setting up your account" : "Almost there"}
          </h2>
          <p className="text-sm text-gray-500">
            {isRetrying
              ? syncPhase === "token"
                ? "Preparing your secure session..."
                : "Connecting your account to our system..."
              : "Your account was created. We just need to finish connecting it to our system."}
          </p>
        </div>

        {serverError ? (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          >
            <p className="font-semibold">Setup incomplete</p>
            <p className="mt-1 whitespace-pre-wrap">{serverError}</p>
          </div>
        ) : null}

        <div className="space-y-3">
          {isRetrying ? (
            <button
              type="button"
              disabled
              className="w-full rounded-lg bg-orange-900 py-3 text-sm font-semibold text-white shadow-md opacity-80"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {syncPhase === "token"
                  ? "Setting up your account..."
                  : "Connecting to our system..."}
              </span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetrySyncBackend}
                className="w-full rounded-lg bg-orange-900 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-orange-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-white"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={handleGoToLogin}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-white"
              >
                Go to login instead
              </button>
              <p className="text-center text-xs text-gray-500">
                Don&apos;t worry — your account is safe. You can log in anytime to complete setup.
              </p>
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="text-center mb-7">
        <h2 className="text-[26px] font-semibold text-gray-900 mb-2">
          Verify your email
        </h2>
        <p className="text-sm text-gray-500">
          We sent a verification code to <strong>{email}</strong>
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <p className="font-semibold">Error</p>
          <p className="mt-1 whitespace-pre-wrap">{serverError}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1">
          <label
            className="block text-[16px] font-semibold text-gray-900"
            htmlFor="employer-verificationCode"
          >
            Verification code
          </label>
          <input
            className={inputClasses(false)}
            id="employer-verificationCode"
            name="verificationCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            autoFocus
          />
        </div>

        <button
          type="button"
          onClick={handleVerification}
          disabled={isVerifying || !verificationCode.trim()}
          className="w-full rounded-lg bg-orange-900 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-orange-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isVerifying ? "Verifying..." : "Verify email"}
        </button>

        <p className="text-center text-xs text-gray-500">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            disabled={resendCooldown > 0}
            onClick={handleResendCode}
            className={`font-semibold ${resendCooldown > 0 ? "text-gray-400 cursor-not-allowed" : "text-orange-900 hover:underline"}`}
          >
            {resendCooldown > 0
              ? `Resend code (${resendCooldown}s)`
              : "Resend code"}
          </button>
        </p>
      </div>
    </>
  );
}
