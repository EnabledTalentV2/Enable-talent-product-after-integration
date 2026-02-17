"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import type { FormEvent, RefObject } from "react";

const inputClasses = (hasError?: boolean) =>
  `w-full h-11 rounded-lg border bg-white px-4 text-sm text-gray-700 transition-shadow placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-gray-200 focus:border-orange-500 focus:ring-orange-500"
  }`;

type FieldErrors = Partial<{
  fullName: string;
  employerName: string;
  email: string;
  password: string;
  confirmPassword: string;
}>;

type EmployerSignupFormProps = {
  fullName: string;
  employerName: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  fieldErrors: FieldErrors;
  serverError: string | null;
  hasErrors: boolean;
  isSubmitting: boolean;
  fullNameRef: RefObject<HTMLInputElement | null>;
  employerNameRef: RefObject<HTMLInputElement | null>;
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
  setEmployerName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  togglePassword: () => void;
  toggleConfirmPassword: () => void;
  clearFieldError: (field: keyof FieldErrors) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function EmployerSignupForm({
  fullName,
  employerName,
  email,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  fieldErrors,
  serverError,
  hasErrors,
  isSubmitting,
  fullNameRef,
  employerNameRef,
  emailRef,
  passwordRef,
  confirmPasswordRef,
  errorSummaryRef,
  fieldMeta,
  setFullName,
  setEmployerName,
  setEmail,
  setPassword,
  setConfirmPassword,
  togglePassword,
  toggleConfirmPassword,
  clearFieldError,
  handleSubmit,
}: EmployerSignupFormProps) {
  return (
    <>
      <div className="text-center mb-7">
        <h2
          id="employer-signup-heading"
          className="text-[26px] font-semibold text-gray-900 mb-2"
        >
          Sign Up
        </h2>
        <p className="text-sm text-gray-500">
          Create an employer account to start hiring
        </p>
      </div>

      <form
        className="space-y-4"
        aria-labelledby="employer-signup-heading"
        noValidate
        onSubmit={handleSubmit}
      >
        {hasErrors ? (
          <div
            ref={errorSummaryRef}
            role="alert"
            tabIndex={-1}
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
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
        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <p className="font-semibold">Error</p>
            <p className="mt-1 whitespace-pre-wrap">{serverError}</p>
          </div>
        )}
        <div className="space-y-1">
          <label
            className="block text-[16px] font-semibold text-gray-900"
            htmlFor="employer-fullname"
          >
            Full name
            <span aria-hidden="true" className="text-gray-500">
              {" "}
              *
            </span>
            <span className="sr-only">required</span>
          </label>
          <input
            type="text"
            placeholder="Enter full name"
            className={inputClasses(Boolean(fieldErrors.fullName))}
            id="employer-fullname"
            name="fullName"
            autoComplete="name"
            value={fullName}
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={
              fieldErrors.fullName ? "employer-fullname-error" : undefined
            }
            aria-required="true"
            onChange={(e) => {
              setFullName(e.target.value);
              clearFieldError("fullName");
            }}
            ref={fullNameRef}
          />
          {fieldErrors.fullName && (
            <p
              id="employer-fullname-error"
              className="mt-1 text-sm text-red-600"
            >
              {fieldErrors.fullName}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            className="block text-[16px] font-semibold text-gray-900"
            htmlFor="employer-name"
          >
            Employer name
            <span aria-hidden="true" className="text-gray-500">
              {" "}
              *
            </span>
            <span className="sr-only">required</span>
          </label>
          <input
            type="text"
            placeholder="Enter employer name"
            className={inputClasses(Boolean(fieldErrors.employerName))}
            id="employer-name"
            name="employerName"
            autoComplete="organization"
            value={employerName}
            aria-invalid={Boolean(fieldErrors.employerName)}
            aria-describedby={
              fieldErrors.employerName ? "employer-name-error" : undefined
            }
            aria-required="true"
            onChange={(e) => {
              setEmployerName(e.target.value);
              clearFieldError("employerName");
            }}
            ref={employerNameRef}
          />
          {fieldErrors.employerName && (
            <p
              id="employer-name-error"
              className="mt-1 text-sm text-red-600"
            >
              {fieldErrors.employerName}
            </p>
          )}
        </div>

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
            className={inputClasses(Boolean(fieldErrors.email))}
            id="employer-email"
            name="email"
            autoComplete="email"
            value={email}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "employer-email-error" : undefined
            }
            aria-required="true"
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            ref={emailRef}
          />
          {fieldErrors.email && (
            <p
              id="employer-email-error"
              className="mt-1 text-sm text-red-600"
            >
              {fieldErrors.email}
            </p>
          )}
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
              className={`${inputClasses(
                Boolean(fieldErrors.password),
              )} pr-14`}
              id="employer-password"
              name="password"
              autoComplete="new-password"
              value={password}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password
                  ? "employer-password-error"
                  : undefined
              }
              aria-required="true"
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
              ref={passwordRef}
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
          {fieldErrors.password && (
            <p
              id="employer-password-error"
              className="mt-1 text-sm text-red-600"
            >
              {fieldErrors.password}
            </p>
          )}
          <PasswordStrengthIndicator password={password} show={true} />
        </div>

        <div className="space-y-1">
          <label
            className="block text-[16px] font-semibold text-gray-900"
            htmlFor="employer-confirm-password"
          >
            Confirm Password
            <span aria-hidden="true" className="text-gray-500">
              {" "}
              *
            </span>
            <span className="sr-only">required</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              className={`${inputClasses(
                Boolean(fieldErrors.confirmPassword),
              )} pr-14`}
              id="employer-confirm-password"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={
                fieldErrors.confirmPassword
                  ? "employer-confirm-password-error"
                  : undefined
              }
              aria-required="true"
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearFieldError("confirmPassword");
              }}
              ref={confirmPasswordRef}
            />
            <button
              type="button"
              onClick={toggleConfirmPassword}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              aria-pressed={showConfirmPassword}
              aria-controls="employer-confirm-password"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
            >
              {showConfirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p
              id="employer-confirm-password-error"
              className="mt-1 text-sm text-red-600"
            >
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <div id="clerk-captcha" className="mt-4" />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-2 text-center text-[11px] text-gray-500">
          Takes less than 2 minutes
        </p>
      </form>

      <div className="mt-6 text-center space-y-4">
        <p className="text-[13px] text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login-employer"
            className="text-[#C04622] font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>

      <div className="mt-6 text-center text-[11px] text-gray-500">
        By clicking login, you agree to our{" "}
        <Link
          href="/terms"
          className="underline text-gray-600 hover:text-gray-700"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline text-gray-600 hover:text-gray-700"
        >
          Privacy Policy
        </Link>
      </div>
    </>
  );
}
