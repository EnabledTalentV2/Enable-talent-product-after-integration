"use client";

import type { FormEvent, RefObject } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const inputClasses =
  "w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 transition-shadow placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-orange-500 focus:ring-orange-500";

type EmployerLoginFormProps = {
  continuePath: string;
  email: string;
  password: string;
  showPassword: boolean;
  isLoaded: boolean;
  isSubmitting: boolean;
  isCheckingSession: boolean;
  isSyncing: boolean;
  hasExistingSession: boolean;
  needsSync: boolean;
  needsPasswordReset: boolean;
  hasError: boolean;
  error: string | null;
  roleWarning: string | null;
  syncRetryCount: number;
  warningSummaryRef: RefObject<HTMLDivElement | null>;
  errorSummaryRef: RefObject<HTMLDivElement | null>;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  togglePassword: () => void;
  handleSignOut: () => void | Promise<void>;
  handleSyncAccount: () => void | Promise<void>;
};

export default function EmployerLoginForm({
  continuePath,
  email,
  password,
  showPassword,
  isLoaded,
  isSubmitting,
  isCheckingSession,
  isSyncing,
  hasExistingSession,
  needsSync,
  needsPasswordReset,
  hasError,
  error,
  roleWarning,
  syncRetryCount,
  warningSummaryRef,
  errorSummaryRef,
  handleSubmit,
  setEmail,
  setPassword,
  togglePassword,
  handleSignOut,
  handleSyncAccount,
}: EmployerLoginFormProps) {
  return (
    <>
      <div className="text-center mb-7">
        <h2
          id="employer-login-heading"
          className="text-[26px] font-semibold text-gray-900 mb-2"
        >
          Employer Login
        </h2>
        <p className="text-sm text-gray-500">
          Enter your credentials to access your account
        </p>
      </div>

      {/* OAuth Login Buttons */}
      {/* <div className="space-y-3 mb-6">
        <button
          type="button"
          onClick={() => handleOAuthSignIn("oauth_google")}
          disabled={!isLoaded || hasExistingSession}
          className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuthSignIn("oauth_github")}
          disabled={!isLoaded || hasExistingSession}
          className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          Continue with GitHub
        </button>
      </div> */}

      {/* Divider */}
      {/* <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">or login with email</span>
        </div>
      </div> */}

      <form
        className="space-y-4"
        aria-labelledby="employer-login-heading"
        noValidate
        onSubmit={handleSubmit}
      >
        {roleWarning ? (
          <div
            ref={warningSummaryRef}
            id="employer-login-warning"
            role="alert"
            tabIndex={-1}
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
          >
            <p>{roleWarning}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href="/login-talent"
                className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
              >
                Go to Talent Login
              </Link>
              <Link
                href="/signup-employer"
                className="inline-flex items-center justify-center rounded-lg bg-amber-700 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-800"
              >
                Create Employer Account
              </Link>
            </div>
          </div>
        ) : null}

        {hasExistingSession && !needsSync && !roleWarning && !isSubmitting && isCheckingSession ? (
          <div
            id="employer-login-redirecting"
            role="status"
            className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700"
          >
            <p>You&apos;re already signed in. Redirecting to your dashboard...</p>
          </div>
        ) : null}

        {hasExistingSession && !needsSync && !roleWarning && !isSubmitting && !isCheckingSession ? (
          <div
            id="employer-login-already-signed-in"
            role="status"
            className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700"
          >
            <p>
              You&apos;re already signed in in this browser. Continue to your
              employer dashboard or sign out to use a different account.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href={continuePath}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
              >
                Continue
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : null}

        {error ? (
          <div
            ref={errorSummaryRef}
            id="employer-login-error"
            role="alert"
            tabIndex={-1}
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <p>{error}</p>
            {needsPasswordReset ? (
              <Link
                href="/forgot-password?from=employer"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500"
              >
                Set a password (Reset)
              </Link>
            ) : null}
            {needsSync && syncRetryCount < 2 && (
              <>
                <button
                  type="button"
                  onClick={handleSyncAccount}
                  disabled={isSyncing}
                  className="mt-3 w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-2 px-4 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSyncing
                    ? `Syncing... (${2 - syncRetryCount} attempt${2 - syncRetryCount === 1 ? '' : 's'} left)`
                    : `Sync Account (${2 - syncRetryCount} attempt${2 - syncRetryCount === 1 ? '' : 's'} left)`}
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSyncing}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white py-2 px-4 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        ) : null}

        <div className="space-y-1">
          <label
            className="block text-[16px] font-semibold text-gray-900"
            htmlFor="employer-email"
          >
            Email
            <span aria-hidden="true" className="text-gray-500">
              {" "}
              *
            </span>
            <span className="sr-only">required</span>
          </label>
          <input
            type="email"
            placeholder="Enter email"
            className={inputClasses}
            id="employer-email"
            name="email"
            autoComplete="email"
            value={email}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? "employer-login-error" : undefined
            }
            aria-required="true"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label
            className="block text-[16px] font-semibold text-gray-900"
            htmlFor="employer-password"
          >
            Password
            <span aria-hidden="true" className="text-gray-500">
              {" "}
              *
            </span>
            <span className="sr-only">required</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              className={`${inputClasses} pr-14`}
              id="employer-password"
              name="password"
              autoComplete="current-password"
              value={password}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? "employer-login-error" : undefined
              }
              aria-required="true"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={togglePassword}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              aria-pressed={showPassword}
              aria-controls="employer-password"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end text-[13px]">
          <Link
            href="/forgot-password?from=employer"
            title="Forgot Password"
            className="text-[#C04622] font-medium hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isLoaded || hasExistingSession}
          className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 text-center space-y-4">
        <p className="text-[13px] text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup-employer"
            className="text-[#C04622] font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </>
  );
}
