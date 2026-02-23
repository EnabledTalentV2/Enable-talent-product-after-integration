"use client";
import { scrollBehavior } from "@/lib/utils/scrollBehavior";

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { validatePasswordStrength } from "@/lib/utils/passwordValidation";
import { syncBackendWithRetry } from "@/lib/helpers/syncBackendWithRetry";

type FieldErrors = Partial<{
  fullName: string;
  employerName: string;
  email: string;
  password: string;
  confirmPassword: string;
}>;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const maybeError = error as {
      errors?: Array<{ message?: string }>;
      message?: string;
    };
    const clerkMessage = maybeError.errors?.[0]?.message;
    if (typeof clerkMessage === "string" && clerkMessage.trim()) {
      return clerkMessage;
    }
    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
};

export function useEmployerSignup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, setActive } = useSignUp();
  const { signOut, getToken } = useAuth();

  const [fullName, setFullName] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(
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
  const [syncPhase, setSyncPhase] = useState<"token" | "sync" | null>(null);

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
    { key: "confirmPassword", label: "Confirm password", ref: confirmPasswordRef },
  ];

  useEffect(() => {
    return () => {
      syncRunIdRef.current += 1;
    };
  }, []);

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

  const handleGoToLogin = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("[signup-employer] signOut failed:", err);
    } finally {
      router.replace("/login-employer");
    }
  };

  const doSyncBackend = async (createdUserId: string, emailAddress: string): Promise<boolean> => {
    syncRunIdRef.current += 1;
    return syncBackendWithRetry(createdUserId, emailAddress, {
      getToken,
      setSyncPhase,
      setError: setServerError,
      setIsRetrying,
      getRunId: () => syncRunIdRef.current,
      logLabel: "signup-employer",
    });
  };

  const handleVerification = async () => {
    if (!signUp || !verificationCode.trim()) return;
    setIsVerifying(true);
    setServerError(null);
    setVerificationComplete(false);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete" && result.createdUserId) {
        setVerificationComplete(true);
        setIsRetrying(true);
        setSyncPhase("token");

        if (!result.createdSessionId) {
          throw new Error("Session could not be created. Please try again.");
        }

        await setActive({ session: result.createdSessionId });
        await sleep(1000);

        setIsVerifying(false);
        const syncOk = await doSyncBackend(result.createdUserId, email.trim());

        if (!syncOk) {
          setServerError(
            "Your account was created successfully, but we couldn't connect it to our system. This is usually a temporary issue. You can try again now or log in later - your account is safe."
          );
          return;
        }

        router.push("/signup-employer/organisation-info");
      } else {
        setServerError("Verification failed. Please try again.");
      }
    } catch (err: unknown) {
      console.error("[signup-employer] Verification error:", err);
      setServerError(
        getErrorMessage(err, "Failed to complete signup. Please try again.")
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setServerError(null);
      setResendCooldown(30);
    } catch {
      setServerError("Failed to resend code. Please try again.");
    }
  };

  const handleRetrySyncBackend = () => {
    if (signUp?.createdUserId) {
      void doSyncBackend(signUp.createdUserId, email.trim());
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setFieldErrors({});
    setServerError(null);

    const trimmedName = fullName.trim();
    const trimmedEmployerName = employerName.trim();
    const trimmedEmail = email.trim();

    const nextErrors: FieldErrors = {};
    if (!trimmedName) nextErrors.fullName = "Full name is required.";
    if (!trimmedEmployerName) nextErrors.employerName = "Employer name is required.";
    if (!trimmedEmail) nextErrors.email = "Email is required.";
    if (!password) {
      nextErrors.password = "Password is required.";
    } else {
      const passwordStrength = validatePasswordStrength(password);
      if (!passwordStrength.isStrong) {
        nextErrors.password = "Password is not strong enough. Please meet all requirements.";
      }
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (password && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      const fieldOrder: Array<[keyof FieldErrors, RefObject<HTMLInputElement | null>]> = [
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
        target.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      if (!signUp) {
        setServerError("Signup not initialized. Please refresh the page.");
        return;
      }

      await signUp.create({ emailAddress: trimmedEmail, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      setResendCooldown(30);
    } catch (err: unknown) {
      console.error("Signup error:", err);
      setServerError(
        getErrorMessage(err, "An unexpected error occurred. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Form
    fullName, setFullName,
    employerName, setEmployerName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, togglePassword: () => setShowPassword((p) => !p),
    showConfirmPassword, toggleConfirmPassword: () => setShowConfirmPassword((p) => !p),
    // Errors
    fieldErrors, serverError, hasErrors, clearFieldError,
    // Status
    isSubmitting, pendingVerification, verificationCode, setVerificationCode,
    isVerifying, resendCooldown, verificationComplete, isRetrying, syncPhase,
    // Refs
    fullNameRef, employerNameRef, emailRef, passwordRef, confirmPasswordRef, errorSummaryRef,
    // Meta
    fieldMeta,
    // Actions
    handleSubmit,
    handleVerification,
    handleResendCode,
    handleRetrySyncBackend,
    handleGoToLogin,
  };
}
