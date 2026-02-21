"use client";

import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import type { FormEvent, RefObject } from "react";

const inputClasses = (hasError?: boolean) =>
  `w-full h-11 rounded-lg border bg-white px-4 text-sm text-slate-900 transition-shadow placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-slate-200 focus:border-[#C27803] focus:ring-[#C27803]/20"
  }`;

type FieldErrors = Partial<{
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}>;

type TalentSignupFormProps = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  fieldErrors: FieldErrors;
  serverError: string | null;
  hasErrors: boolean;
  isSubmitting: boolean;
  oauthLoadingProvider: "google" | "github" | null;
  fullNameRef: RefObject<HTMLInputElement | null>;
  emailRef: RefObject<HTMLInputElement | null>;
  passwordRef: RefObject<HTMLInputElement | null>;
  confirmPasswordRef: RefObject<HTMLInputElement | null>;
  errorSummaryRef: RefObject<HTMLDivElement | null>;
  fieldMeta: Array<{
    key: keyof FieldErrors;
    label: string;
    ref: RefObject<HTMLInputElement | null>;
  }>;
  setFullName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  togglePassword: () => void;
  toggleConfirmPassword: () => void;
  clearFieldError: (field: keyof FieldErrors) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleOAuthGoogle: () => void;
};

export default function TalentSignupForm({
  fullName,
  email,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  fieldErrors,
  serverError,
  hasErrors,
  isSubmitting,
  oauthLoadingProvider,
  fullNameRef,
  emailRef,
  passwordRef,
  confirmPasswordRef,
  errorSummaryRef,
  fieldMeta,
  setFullName,
  setEmail,
  setPassword,
  setConfirmPassword,
  togglePassword,
  toggleConfirmPassword,
  clearFieldError,
  handleSubmit,
  handleOAuthGoogle,
}: TalentSignupFormProps) {
  return (
    <>
      <div className="text-center mb-7">
        <h2
          id="talent-signup-heading"
          className="text-[26px] font-semibold text-slate-900 mb-2"
        >
          Sign Up
        </h2>
        <p className="text-sm text-slate-700">
          Create a Talent account to start applying
        </p>
      </div>

      {/* OAuth Sign Up Buttons */}
      <div className="space-y-3 mb-6" aria-busy={oauthLoadingProvider !== null}>
        <button
          type="button"
          disabled={oauthLoadingProvider !== null}
          onClick={handleOAuthGoogle}
          className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {oauthLoadingProvider === "google" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Redirecting to Google...
            </>
          ) : (
            <>
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
            </>
          )}
        </button>
        {oauthLoadingProvider ? (
          <p role="status" aria-live="polite" className="text-center text-xs text-slate-700">
            Connecting to {oauthLoadingProvider === "google" ? "Google" : "GitHub"}...
          </p>
        ) : null}
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-slate-400">or sign up with email</span>
        </div>
      </div>

      <form
        className="space-y-4"
        aria-labelledby="talent-signup-heading"
        noValidate
        onSubmit={handleSubmit}
      >
        {hasErrors ? (
          <div
            ref={errorSummaryRef}
            role="alert"
            tabIndex={-1}
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            <p className="font-semibold">Please fix the following:</p>
            <ul className="mt-2 space-y-1">
              {fieldMeta.map(({ key, label, ref }) => {
                const message = fieldErrors[key];
                if (!message) return null;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => ref.current?.focus()}
                      className="text-left underline"
                    >
                      {label}: {message}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        {serverError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            <p className="font-semibold">Error</p>
            <p className="mt-1 whitespace-pre-wrap">{serverError}</p>
          </div>
        ) : null}
        <div className="space-y-1">
          <label
            className="block text-[16px] font-semibold text-slate-700"
            htmlFor="fullname"
          >
            Full name
            <span aria-hidden="true" className="text-slate-400">
              {" "}
              *
            </span>
            <span className="sr-only">required</span>
          </label>
          <input
            className={inputClasses(Boolean(fieldErrors.fullName))}
            id="fullname"
            name="fullname"
            type="text"
            autoComplete="name"
            placeholder="Enter full name"
            value={fullName}
            ref={fullNameRef}
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={
              fieldErrors.fullName ? "fullname-error" : undefined
            }
            aria-required="true"
            onChange={(event) => {
              setFullName(event.target.value);
              clearFieldError("fullName");
            }}
            required
          />
          {fieldErrors.fullName ? (
            <p id="fullname-error" className="text-sm text-red-800">
              {fieldErrors.fullName}
            </p>
          ) : null}
        </div>

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
            className={inputClasses(Boolean(fieldErrors.email))}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter email"
            value={email}
            ref={emailRef}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "email-error" : undefined
            }
            aria-required="true"
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            required
          />
          {fieldErrors.email ? (
            <p id="email-error" className="text-sm text-red-800">
              {fieldErrors.email}
            </p>
          ) : null}
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
              className={`${inputClasses(
                Boolean(fieldErrors.password),
              )} pr-14`}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter password"
              value={password}
              ref={passwordRef}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? "password-error" : undefined
              }
              aria-required="true"
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError("password");
              }}
              required
            />
            <button
              type="button"
              onClick={togglePassword}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              aria-pressed={showPassword}
              aria-controls="password"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password ? (
            <p id="password-error" className="text-sm text-red-800">
              {fieldErrors.password}
            </p>
          ) : null}
          <PasswordStrengthIndicator password={password} show={true} />
        </div>

        <div className="space-y-1">
          <label
            className="block text-[16px] font-semibold text-slate-700"
            htmlFor="confirmPassword"
          >
            Confirm password
            <span aria-hidden="true" className="text-slate-400">
              {" "}
              *
            </span>
            <span className="sr-only">required</span>
          </label>
          <div className="relative">
            <input
              className={`${inputClasses(
                Boolean(fieldErrors.confirmPassword),
              )} pr-14`}
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter password"
              value={confirmPassword}
              ref={confirmPasswordRef}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={
                fieldErrors.confirmPassword
                  ? "confirmPassword-error"
                  : undefined
              }
              aria-required="true"
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                clearFieldError("confirmPassword");
              }}
              required
            />
            <button
              type="button"
              onClick={toggleConfirmPassword}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              aria-pressed={showConfirmPassword}
              aria-controls="confirmPassword"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] cursor-pointer"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword ? (
            <p
              id="confirmPassword-error"
              className="text-sm text-red-800"
            >
              {fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>

        <div id="clerk-captcha" className="mt-4" />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 w-full rounded-lg bg-orange-900 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(182,97,35,0.35)] transition-colors hover:bg-orange-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </button>

        <p className="text-[11px] text-center text-slate-700 mt-2">
          Takes less than 2 minutes
        </p>
      </form>

      <div className="mt-6 text-center space-y-4">
        <p className="text-[13px] text-slate-700">
          Already have an account?{" "}
          <Link
            className="font-semibold text-orange-900 hover:underline"
            href="/login-talent"
          >
            Login
          </Link>
        </p>

        <p className="text-[11px] text-slate-700">
          By clicking Create account, you agree to our{" "}
          <Link
            href="/terms"
            className="underline text-slate-700 hover:text-slate-700"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline text-slate-700 hover:text-slate-700"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </>
  );
}
