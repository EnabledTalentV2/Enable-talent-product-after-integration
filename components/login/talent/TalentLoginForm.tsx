"use client";

import type { FormEvent, RefObject } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const inputClasses =
  "w-full h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 transition-shadow placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-[#E58C3A] focus:ring-[#F6C071]/60";

type TalentLoginFormProps = {
  continuePath: string;
  email: string;
  password: string;
  showPassword: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  isCheckingSession: boolean;
  isSyncing: boolean;
  hasExistingSession: boolean;
  needsSync: boolean;
  hasError: boolean;
  error: string | null;
  roleWarning: string | null;
  syncRetryCount: number;
  warningSummaryRef: RefObject<HTMLDivElement | null>;
  errorSummaryRef: RefObject<HTMLDivElement | null>;
  handleOAuthGoogle: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  togglePassword: () => void;
  handleSignOut: () => void | Promise<void>;
  handleSyncAccount: () => void | Promise<void>;
};

export default function TalentLoginForm({
  continuePath,
  email,
  password,
  showPassword,
  isLoaded,
  isLoading,
  isCheckingSession,
  isSyncing,
  hasExistingSession,
  needsSync,
  hasError,
  error,
  roleWarning,
  syncRetryCount,
  warningSummaryRef,
  errorSummaryRef,
  handleOAuthGoogle,
  handleSubmit,
  setEmail,
  setPassword,
  togglePassword,
  handleSignOut,
  handleSyncAccount,
}: TalentLoginFormProps) {
  return (
    <>
      <div className="text-center mb-7">
        <h2
          id="talent-login-heading"
          className="text-[26px] font-semibold text-slate-900 mb-2"
        >
          Login
        </h2>
        <p className="text-sm text-slate-500">Log in to your Talent account</p>
      </div>

      <div className="space-y-3 mb-6">
        <button
          type="button"
          onClick={handleOAuthGoogle}
          disabled={!isLoaded || hasExistingSession}
          className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E58C3A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-slate-400">or login with email</span>
        </div>
      </div>

      <form
        className="space-y-4 "
        aria-labelledby="talent-login-heading"
        noValidate
        onSubmit={handleSubmit}
      >
        {roleWarning ? (
          <div
            ref={warningSummaryRef}
            id="talent-login-warning"
            role="alert"
            tabIndex={-1}
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
          >
            <p>{roleWarning}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href="/login-employer"
                className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
              >
                Go to Employer Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-amber-700 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-800"
              >
                Create Talent Account
              </Link>
            </div>
          </div>
        ) : null}

        {hasExistingSession &&
        !needsSync &&
        !roleWarning &&
        !isLoading &&
        isCheckingSession ? (
          <div
            id="talent-login-redirecting"
            role="status"
            className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
          >
            <p>You&apos;re already signed in. Redirecting to your dashboard...</p>
          </div>
        ) : null}

        {hasExistingSession &&
        !needsSync &&
        !roleWarning &&
        !isLoading &&
        !isCheckingSession ? (
          <div
            id="talent-login-already-signed-in"
            role="status"
            className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
          >
            <p>
              You&apos;re already signed in in this browser. Continue to your
              dashboard or sign out to use a different account.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href={continuePath}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                Continue
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : null}

        {error ? (
          <div
            ref={errorSummaryRef}
            id="talent-login-error"
            role="alert"
            tabIndex={-1}
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <p>{error}</p>
            {needsSync && syncRetryCount < 2 && (
              <>
                <button
                  type="button"
                  onClick={handleSyncAccount}
                  disabled={isSyncing}
                  className="mt-3 w-full rounded-lg bg-gradient-to-r from-[#B45309] to-[#E57E25] py-2 px-4 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E58C3A] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSyncing
                    ? `Syncing... (${2 - syncRetryCount} attempt${2 - syncRetryCount === 1 ? "" : "s"} left)`
                    : `Sync Account (${2 - syncRetryCount} attempt${2 - syncRetryCount === 1 ? "" : "s"} left)`}
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSyncing}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E58C3A] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        ) : null}

        <div className="space-y-1">
          <label
            className="block text-[16px] font-semibold text-slate-700"
            htmlFor="email"
          >
            Email
            <span aria-hidden="true" className="text-slate-400">
              {" "}
              *
            </span>
            <span className="sr-only">required</span>
          </label>
          <input
            className={inputClasses}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter email"
            value={email}
            aria-invalid={hasError}
            aria-describedby={hasError ? "talent-login-error" : undefined}
            aria-required="true"
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label
            className="block text-[16px] font-semibold text-slate-700"
            htmlFor="password"
          >
            Password
            <span aria-hidden="true" className="text-slate-400">
              {" "}
              *
            </span>
            <span className="sr-only">required</span>
          </label>
          <div className="relative">
            <input
              className={`${inputClasses} pr-14`}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              aria-invalid={hasError}
              aria-describedby={hasError ? "talent-login-error" : undefined}
              aria-required="true"
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={togglePassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              aria-controls="password"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E58C3A] cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end text-[13px]">
          <Link
            href="/forgot-password?from=talent"
            title="Forgot Password"
            className="font-medium text-[#B45309] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isLoaded || hasExistingSession}
          className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#B45309] to-[#E57E25] py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(182,97,35,0.35)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E58C3A] focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Signing in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 text-center space-y-4">
        <p className="text-[13px] text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-[#B45309] hover:underline" href="/signup">
            Sign up
          </Link>
        </p>

        <p className="text-[11px] text-slate-500">
          By clicking login, you agree to our{" "}
          <Link
            href="/terms"
            className="underline text-slate-600 hover:text-slate-700"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline text-slate-600 hover:text-slate-700"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </>
  );
}
