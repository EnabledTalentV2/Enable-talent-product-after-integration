"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import backgroundVectorSvg from "@/public/Vector 4500.svg";
import logo from "@/public/logo/ET Logo-01.webp";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { validatePasswordStrength } from "@/lib/utils/passwordValidation";
import { apiRequest, isApiError } from "@/lib/api-client";
import { deriveUserRoleFromUserData } from "@/lib/roleUtils";

const inputClasses =
  "w-full h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 transition-shadow placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-[#E58C3A] focus:ring-[#F6C071]/60";

type Step = "email" | "otp" | "new-password" | "success";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, setActive } = useSignIn();

  const fromPage = searchParams.get("from");
  const backLink =
    fromPage === "employer" ? "/login-employer" : "/login-talent";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendCode = async () => {
    if (!signIn) return;
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: trimmed,
      });
      setStep("otp");
      setResendCooldown(30);
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message ||
          "Failed to send reset code. Please check your email and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!signIn) return;
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter the verification code.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: trimmed,
      });
      if (result.status === "needs_new_password") {
        setStep("new-password");
      } else {
        setError("Unexpected response. Please try again.");
      }
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message || "Invalid code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signIn) return;
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setResendCooldown(30);
      setError(null);
    } catch {
      setError("Failed to resend code. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    if (!signIn) return;

    if (!password) {
      setError("Password is required.");
      return;
    }
    const strength = validatePasswordStrength(password);
    if (!strength.isStrong) {
      setError("Password is not strong enough. Please meet all requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const result = await signIn.resetPassword({
        password,
        signOutOfOtherSessions: true,
      });

      if (result.status === "complete" && result.createdSessionId) {
        // Activate the new session
        await setActive({ session: result.createdSessionId });

        // Check if user exists in Django backend and determine role
        try {
          const userData = await apiRequest<unknown>("/api/user/me", {
            method: "GET",
          });
          const derivedRole = deriveUserRoleFromUserData(userData);

          if (derivedRole === "employer") {
            router.push("/employer/dashboard");
          } else {
            router.push("/dashboard/home");
          }
          return;
        } catch (userMeError: unknown) {
          // User exists in Clerk but not Django - redirect to login page
          // which has the sync account flow
          if (isApiError(userMeError) && userMeError.status === 401) {
            const loginPath =
              fromPage === "employer"
                ? "/login-employer?reason=backend_user_missing"
                : "/login-talent";
            router.push(loginPath);
            return;
          }
          // Other errors - still show success, let user login manually
        }
      }

      setStep("success");
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "email":
        return (
          <>
            <div className="text-center mb-7">
              <h2 className="text-[26px] font-semibold text-slate-900 mb-2">
                Reset your password
              </h2>
              <p className="text-sm text-slate-500">
                Enter your email and we&apos;ll send you a code to reset your
                password.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label
                  className="block text-[16px] font-semibold text-slate-700"
                  htmlFor="reset-email"
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
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendCode();
                    }
                  }}
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-[#B45309] to-[#E57E25] py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(182,97,35,0.35)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E58C3A] focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending code...
                  </span>
                ) : (
                  "Send reset code"
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                href={backLink}
                className="text-[13px] font-semibold text-[#B45309] hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </>
        );

      case "otp":
        return (
          <>
            <div className="text-center mb-7">
              <h2 className="text-[26px] font-semibold text-slate-900 mb-2">
                Check your email
              </h2>
              <p className="text-sm text-slate-500">
                We sent a verification code to{" "}
                <strong>{email}</strong>
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label
                  className="block text-[16px] font-semibold text-slate-700"
                  htmlFor="reset-code"
                >
                  Verification code
                </label>
                <input
                  className={inputClasses}
                  id="reset-code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleVerifyCode();
                    }
                  }}
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={isLoading || !code.trim()}
                className="w-full rounded-lg bg-gradient-to-r from-[#B45309] to-[#E57E25] py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(182,97,35,0.35)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E58C3A] focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify code"
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleResendCode}
                  className={`font-semibold ${
                    resendCooldown > 0
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-[#B45309] hover:underline"
                  }`}
                >
                  {resendCooldown > 0
                    ? `Resend code (${resendCooldown}s)`
                    : "Resend code"}
                </button>
              </p>

              <p className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError(null);
                  }}
                  className="text-[13px] text-slate-500 hover:underline"
                >
                  Use a different email
                </button>
              </p>
            </div>
          </>
        );

      case "new-password":
        return (
          <>
            <div className="text-center mb-7">
              <h2 className="text-[26px] font-semibold text-slate-900 mb-2">
                Set new password
              </h2>
              <p className="text-sm text-slate-500">
                Choose a strong password for your account.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label
                  className="block text-[16px] font-semibold text-slate-700"
                  htmlFor="new-password"
                >
                  New password
                  <span aria-hidden="true" className="text-slate-400">
                    {" "}
                    *
                  </span>
                  <span className="sr-only">required</span>
                </label>
                <div className="relative">
                  <input
                    className={`${inputClasses} pr-14`}
                    id="new-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    aria-controls="new-password"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E58C3A] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                <PasswordStrengthIndicator password={password} show={true} />
              </div>

              <div className="space-y-1">
                <label
                  className="block text-[16px] font-semibold text-slate-700"
                  htmlFor="confirm-new-password"
                >
                  Confirm new password
                  <span aria-hidden="true" className="text-slate-400">
                    {" "}
                    *
                  </span>
                  <span className="sr-only">required</span>
                </label>
                <div className="relative">
                  <input
                    className={`${inputClasses} pr-14`}
                    id="confirm-new-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleResetPassword();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showConfirmPassword}
                    aria-controls="confirm-new-password"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E58C3A] cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-[#B45309] to-[#E57E25] py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(182,97,35,0.35)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E58C3A] focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resetting password...
                  </span>
                ) : (
                  "Reset password"
                )}
              </button>
            </div>
          </>
        );

      case "success":
        return (
          <>
            <div className="text-center mb-7">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-[26px] font-semibold text-slate-900 mb-2">
                Password reset successful!
              </h2>
              <p className="text-sm text-slate-500">
                Your password has been updated. You can now log in with your new
                password.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/login-talent"
                className="block w-full rounded-lg bg-gradient-to-r from-[#B45309] to-[#E57E25] py-3 text-center text-sm font-semibold text-white shadow-[0_12px_24px_rgba(182,97,35,0.35)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E58C3A] focus-visible:ring-offset-white"
              >
                Login as Talent
              </Link>
              <Link
                href="/login-employer"
                className="block w-full rounded-lg border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E58C3A]"
              >
                Login as Employer
              </Link>
            </div>
          </>
        );
    }
  };

  return (
    <main
      id="main-content"
      className="min-h-screen w-full bg-gradient-to-br from-[#F7D877] via-[#F2BF4A] to-[#E8A426] relative overflow-hidden flex flex-col items-center md:justify-center"
    >
      <div className="w-full p-6 z-30 flex justify-start md:absolute md:top-0 md:left-0">
        <Link
          href={backLink}
          className="group flex items-center gap-2 text-sm font-medium text-slate-900 transition-colors hover:text-[#8C4A0A] bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C4A0A] focus-visible:ring-offset-2"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
          Back to Login
        </Link>
      </div>
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src={backgroundVectorSvg}
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-5xl px-0">
        <div className="pointer-events-none absolute inset-0 rounded-[36px] border border-white/35 bg-gradient-to-br from-[#F7D877]/90 via-[#F2BF4A]/90 to-[#E8A426]/90 backdrop-blur-sm shadow-[0_20px_50px_rgba(120,72,12,0.18)]" />
        <div className="relative flex w-full flex-col items-center justify-center gap-12 px-0 py-4 md:flex-row md:gap-20">
          {/* Left Side Content */}
          <div className="flex max-w-105 flex-col items-center text-center">
            <div className="relative mb-8 flex items-center justify-center">
              <div className="pointer-events-none absolute -inset-8 rounded-full bg-[#8C4A0A] opacity-70 blur-3xl mix-blend-multiply" />
              <div className="pointer-events-none absolute -inset-3 rounded-full bg-[#B45309] opacity-90 blur-2xl mix-blend-multiply" />
              <a
                href="https://www.enabledtalent.com/"
                className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/70 bg-white/85 shadow-[0_12px_24px_rgba(146,86,16,0.2)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C4A0A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2BF4A]"
                aria-label="Enabled Talent Logo - Back to Homepage"
              >
                <Image
                  src={logo}
                  alt=""
                  className="h-12 w-12 object-contain"
                  aria-hidden="true"
                />
              </a>
            </div>

            <h1 className="text-3xl font-semibold text-slate-900 mb-4 leading-tight md:text-4xl">
              Reset Your Password
            </h1>
            <p className="text-base text-slate-800 md:text-lg">
              Don&apos;t worry, we&apos;ll help you get back in
            </p>
          </div>

          {/* Right Side Card */}
          <div className="w-full max-w-[460px] rounded-[32px] bg-white px-8 py-10 shadow-[0_25px_60px_rgba(120,72,12,0.18)] md:px-10 md:py-12">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
