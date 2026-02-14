"use client";

import Image from "next/image";
import Link from "next/link";
import backgroundVectorSvg from "@/public/Vector 4500.svg";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import logo from "@/public/logo/ET Logo-01.webp";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import { apiRequest, getApiErrorMessage } from "@/lib/api-client";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { validatePasswordStrength } from "@/lib/utils/passwordValidation";

const SYNC_RETRY_WINDOW_MS = 30_000;
const SYNC_ATTEMPT_TIMEOUT_MS = 10_000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

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

function SignupEmployerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, setActive } = useSignUp();
  const { signOut } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(
    searchParams?.get("error") === "account_incomplete"
      ? "Your account setup was incomplete. Please sign up again to complete registration."
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [oauthLoadingProvider, setOauthLoadingProvider] = useState<
    "google" | "github" | null
  >(null);

  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const employerNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const syncRunIdRef = useRef(0);
  const hasErrors = Object.keys(fieldErrors).length > 0;
  const fieldMeta: Array<{
    key: keyof FieldErrors;
    label: string;
    ref: RefObject<HTMLInputElement | null>;
  }> = [
    { key: "fullName", label: "Full name", ref: fullNameRef },
    { key: "employerName", label: "Employer name", ref: employerNameRef },
    { key: "email", label: "Email", ref: emailRef },
    { key: "password", label: "Password", ref: passwordRef },
    {
      key: "confirmPassword",
      label: "Confirm password",
      ref: confirmPasswordRef,
    },
  ];

  useEffect(() => {
    return () => {
      // Cancel any in-flight sync loop so it won't set state after unmount.
      syncRunIdRef.current += 1;
    };
  }, []);

  const handleGoToLogin = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("[signup-employer] signOut failed:", err);
    } finally {
      router.replace("/login-employer");
    }
  };

  const syncBackendWithRetry = async (
    createdUserId: string,
    emailAddress: string,
  ): Promise<boolean> => {
    const runId = (syncRunIdRef.current += 1);
    const deadline = Date.now() + SYNC_RETRY_WINDOW_MS;
    let delayMs = 900;
    let attempt = 0;

    setIsRetrying(true);
    setRetryCount(0);
    setError(
      "Account created. Finishing setup by syncing with our backend. This can take up to 30 seconds...",
    );

    try {
      while (Date.now() < deadline) {
        if (runId !== syncRunIdRef.current) return false;
        attempt += 1;
        setRetryCount(attempt);

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
              clerk_user_id: createdUserId,
              email: emailAddress,
            }),
              signal: controller.signal,
          });
          } finally {
            clearTimeout(timeoutId);
          }
          return true;
        } catch (err) {
          const remainingMs = Math.max(0, deadline - Date.now());
          const remainingSec = Math.ceil(remainingMs / 1000);
          console.error("[signup-employer] Backend sync attempt failed:", err);
          setError(
            `${getApiErrorMessage(
              err,
              "Account sync failed.",
            )} Retrying automatically for up to ${remainingSec}s...`,
          );
          if (remainingMs <= 0) break;
          await sleep(Math.min(delayMs, remainingMs));
          delayMs = Math.min(Math.round(delayMs * 1.7), 5_000);
        }
      }

      return false;
    } finally {
      if (runId === syncRunIdRef.current) {
        setIsRetrying(false);
      }
    }
  };

  const handleVerification = async () => {
    if (!signUp || !verificationCode.trim()) return;
    setIsVerifying(true);
    setError(null);
    setVerificationComplete(false);
    setRetryCount(0);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete" && result.createdUserId) {
        setVerificationComplete(true);

        if (!result.createdSessionId) {
          throw new Error("Session could not be created. Please try again.");
        }

        // Activate the Clerk session immediately so server-side proxy routes
        // can mint a Clerk template JWT for authenticated backend calls.
        await setActive({ session: result.createdSessionId });

        setIsVerifying(false);
        const syncOk = await syncBackendWithRetry(
          result.createdUserId,
          email.trim(),
        );

        if (!syncOk) {
          setError(
            "Account created, but setup couldn't be completed right now. Please try again later. You have been signed out.",
          );
          try {
            await signOut();
          } catch (err) {
            console.error(
              "[signup-employer] signOut failed after sync timeout:",
              err,
            );
          }
          return;
        }

        router.push("/signup-employer/organisation-info");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("[signup-employer] Verification error:", err);
      const errorMessage =
        err.errors?.[0]?.message ||
        err.message ||
        "Failed to complete signup. Please try again.";
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOAuthSignUp = async (strategy: OAuthStrategy) => {
    if (!signUp) return;
    const provider =
      strategy === "oauth_google"
        ? "google"
        : strategy === "oauth_github"
        ? "github"
        : null;
    setOauthLoadingProvider(provider);
    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/signup-employer/oauth-complete",
      });
    } catch (err: any) {
      console.error("[signup-employer] OAuth error:", err);
      setError(
        err.errors?.[0]?.message || "OAuth sign up failed. Please try again."
      );
      setOauthLoadingProvider(null);
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (hasErrors) {
      errorSummaryRef.current?.focus();
    }
  }, [hasErrors]);

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setFieldErrors({});
    setError(null);

    const trimmedName = fullName.trim();
    const trimmedEmployerName = employerName.trim();
    const trimmedEmail = email.trim();

    const nextErrors: FieldErrors = {};
    if (!trimmedName) {
      nextErrors.fullName = "Full name is required.";
    }
    if (!trimmedEmployerName) {
      nextErrors.employerName = "Employer name is required.";
    }
    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    }
    if (!password) {
      nextErrors.password = "Password is required.";
    } else {
      const passwordStrength = validatePasswordStrength(password);
      if (!passwordStrength.isStrong) {
        nextErrors.password =
          "Password is not strong enough. Please meet all requirements.";
      }
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (password && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      const fieldOrder: Array<
        [keyof FieldErrors, RefObject<HTMLInputElement | null>]
      > = [
        ["fullName", fullNameRef],
        ["employerName", employerNameRef],
        ["email", emailRef],
        ["password", passwordRef],
        ["confirmPassword", confirmPasswordRef],
      ];
      const firstInvalid = fieldOrder.find(([key]) => nextErrors[key]);
      const target = firstInvalid?.[1]?.current;
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create account with Clerk
      if (!signUp) {
        setError("Signup not initialized. Please refresh the page.");
        return;
      }

      await signUp.create({
        emailAddress: trimmedEmail,
        password: password,
      });

      // Step 2: Send email verification OTP
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      setResendCooldown(30);
    } catch (err: any) {
      console.error("Signup error:", err);
      const errorMessage =
        err.errors?.[0]?.message ||
        err.message ||
        "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      id="main-content"
      className="min-h-screen w-full bg-[#C5D8F5] relative overflow-hidden flex flex-col items-center md:justify-center"
    >
      <div className="w-full p-6 z-30 flex justify-start md:absolute md:top-0 md:left-0">
        <a
          href="https://www.enabledtalent.com/"
          className="group flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-[#C04622] bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C04622] focus-visible:ring-offset-2"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
          Back to Homepage
          <span className="sr-only">(opens external site)</span>
        </a>
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
        <div className="pointer-events-none absolute inset-0 rounded-[36px] border border-white/35 bg-[#C5D8F5]/90 backdrop-blur-sm shadow-[0_20px_50px_rgba(120,72,12,0.18)]" />
        <div className="relative flex w-full flex-col items-center justify-center gap-12 px-0 py-4 md:flex-row md:gap-20">
          {/* Left Side - Welcome */}
          <div className="flex max-w-105 flex-col items-center text-center">
            <div className="relative mb-8 flex items-center justify-center">
              {/* Orange glow effect behind logo */}
              <div className="pointer-events-none absolute -inset-8 rounded-full bg-orange-400/50 blur-3xl" />
              <div className="pointer-events-none absolute -inset-3 rounded-full bg-orange-400/70 blur-2xl" />
              <a
                href="https://www.enabledtalent.com/"
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm p-4 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C04622] focus-visible:ring-offset-2 focus-visible:ring-offset-[#C5D8F5]"
                aria-label="Enabled Talent Logo - Back to Homepage"
              >
                <Image
                  src={logo}
                  alt=""
                  width={60}
                  height={60}
                  className="h-12 w-12 object-contain"
                  aria-hidden="true"
                />
              </a>
            </div>

            <h1 className="text-3xl font-semibold text-gray-900 mb-4 leading-tight md:text-4xl">
              Welcome To Enabled Talent
            </h1>
            <p className="text-base text-gray-700 md:text-lg max-w-md">
              Find and hire top talent across Canada - faster and smarter
            </p>
          </div>

          {/* Right Side - Form */}
          <div className="w-full max-w-[460px] rounded-[32px] bg-white px-8 py-10 shadow-xl md:px-10 md:py-12">
            {pendingVerification ? (
              /* OTP Verification View */
              <>
                {verificationComplete ? (
                  <>
                    <div className="text-center mb-7">
                      <h2 className="text-[26px] font-semibold text-gray-900 mb-2">
                        Completing signup
                      </h2>
                      <p className="text-sm text-gray-500">
                        We&apos;re syncing your account so you can continue. This can take up to 30 seconds.
                      </p>
                    </div>

                    {error ? (
                      <div
                        role="alert"
                        className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                      >
                        <p className="font-semibold">Status</p>
                        <p className="mt-1 whitespace-pre-wrap">{error}</p>
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      <button
                        type="button"
                        disabled
                        className="w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-3 text-sm font-semibold text-white shadow-md opacity-80"
                      >
                        {isRetrying ? (
                          <span className="inline-flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Syncing with backend{retryCount ? ` (attempt ${retryCount})` : ""}...
                          </span>
                        ) : (
                          "Setup incomplete"
                        )}
                      </button>

                      {!isRetrying ? (
                        <button
                          type="button"
                          onClick={handleGoToLogin}
                          className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 focus-visible:ring-offset-white"
                        >
                          Go to login
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-7">
                      <h2 className="text-[26px] font-semibold text-gray-900 mb-2">
                        Verify your email
                      </h2>
                      <p className="text-sm text-gray-500">
                        We sent a verification code to <strong>{email}</strong>
                      </p>
                    </div>

                    {error && (
                      <div
                        role="alert"
                        className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                      >
                        <p className="font-semibold">Error</p>
                        <p className="mt-1 whitespace-pre-wrap">{error}</p>
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
                        className="w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isVerifying ? "Verifying..." : "Verify email"}
                      </button>

                      <p className="text-center text-xs text-gray-500">
                        Didn&apos;t receive the code?{" "}
                        <button
                          type="button"
                          disabled={resendCooldown > 0}
                          onClick={async () => {
                            if (!signUp) return;
                            try {
                              await signUp.prepareEmailAddressVerification({
                                strategy: "email_code",
                              });
                              setError(null);
                              setResendCooldown(30);
                            } catch {
                              setError("Failed to resend code. Please try again.");
                            }
                          }}
                          className={`font-semibold ${resendCooldown > 0 ? "text-gray-400 cursor-not-allowed" : "text-[#C04622] hover:underline"}`}
                        >
                          {resendCooldown > 0
                            ? `Resend code (${resendCooldown}s)`
                            : "Resend code"}
                        </button>
                      </p>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Signup Form View */
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

                {/* OAuth Sign Up Buttons */}
                {/* <div className="space-y-3 mb-6" aria-busy={oauthLoadingProvider !== null}>
                  <button
                    type="button"
                    disabled={oauthLoadingProvider !== null}
                    onClick={() => handleOAuthSignUp("oauth_google")}
                    className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {oauthLoadingProvider === "google" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Redirecting to Google...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={oauthLoadingProvider !== null}
                    onClick={() => handleOAuthSignUp("oauth_github")}
                    className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {oauthLoadingProvider === "github" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Redirecting to GitHub...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        Continue with GitHub
                      </>
                    )}
                  </button>
                  {oauthLoadingProvider ? (
                    <p role="status" aria-live="polite" className="text-center text-xs text-gray-500">
                      Connecting to {oauthLoadingProvider === "google" ? "Google" : "GitHub"}...
                    </p>
                  ) : null}
                </div> */}

                {/* Divider */}
                {/* <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-gray-400">or sign up with email</span>
                  </div>
                </div> */}

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
                  {error && (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                      <p className="font-semibold">Error</p>
                      <p className="mt-1 whitespace-pre-wrap">{error}</p>
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
                        onClick={() => setShowPassword(!showPassword)}
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 relative z-20 rounded-[24px] border border-white/50 bg-gradient-to-br from-[#eef6ff]/95 via-[#f5faff]/95 to-[#ffffff]/95 backdrop-blur-sm shadow-[0_10px_25px_rgba(30,58,138,0.10)]">
        <p className="px-8 py-3 text-[14px] font-medium text-slate-900 text-center">
          Are you a Candidate?{" "}
          <Link
            className="font-bold text-[#C04622] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C04622] focus-visible:ring-offset-2 focus-visible:ring-offset-blue-100 rounded-sm"
            href="/signup"
            aria-label="Sign up here for a Candidate account"
          >
            Sign up here!
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignupEmployerPage() {
  return (
    <Suspense fallback={null}>
      <SignupEmployerPageContent />
    </Suspense>
  );
}
