"use client";

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import { apiRequest } from "@/lib/api-client";
import { validatePasswordStrength } from "@/lib/utils/passwordValidation";
import { syncBackendWithRetry } from "@/lib/helpers/syncBackendWithRetry";

type FieldErrors = Partial<{
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}>;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function useTalentSignup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUserData = useUserDataStore((s) => s.setUserData);
  const { signUp, setActive } = useSignUp();
  const { signOut, getToken } = useAuth();

  const [fullName, setFullName] = useState("");
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
  const [oauthLoadingProvider, setOauthLoadingProvider] = useState<"google" | "github" | null>(null);

  const fullNameRef = useRef<HTMLInputElement | null>(null);
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
      console.error("[signup] signOut failed:", err);
    } finally {
      router.replace("/login-talent");
    }
  };

  const doSyncBackend = async (createdUserId: string, emailAddress: string): Promise<boolean> => {
    syncRunIdRef.current += 1;
    const currentRunId = syncRunIdRef.current;
    return syncBackendWithRetry(createdUserId, emailAddress, {
      getToken,
      setSyncPhase,
      setError: setServerError,
      setIsRetrying,
      getRunId: () => syncRunIdRef.current,
      logLabel: "signup",
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
            "Your account was created successfully, but we couldn't connect it to our system. This is usually a temporary issue. You can try again now or log in later — your account is safe."
          );
          return;
        }

        // Update user profile with name
        const [firstName, ...rest] = fullName.trim().split(/\s+/);
        const lastName = rest.join(" ");
        if (firstName || lastName) {
          try {
            await apiRequest("/api/users/profile/", {
              method: "PATCH",
              body: JSON.stringify({ first_name: firstName, last_name: lastName }),
            });
          } catch (err) {
            console.error("[signup] Failed to update user profile:", err);
          }
        }

        router.push("/signup/resume-upload");
      } else {
        setServerError("Verification failed. Please try again.");
      }
    } catch (error: any) {
      console.error("[signup] Verification error:", error);
      const errorMessage =
        error.errors?.[0]?.message || error.message || "Failed to complete signup. Please try again.";
      setServerError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOAuthSignUp = async (strategy: OAuthStrategy) => {
    if (!signUp) return;
    const provider = strategy === "oauth_google" ? "google" : strategy === "oauth_github" ? "github" : null;
    setOauthLoadingProvider(provider);
    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/signup/oauth-complete",
      });
    } catch (error: any) {
      console.error("[signup] OAuth error:", error);
      setServerError(error.errors?.[0]?.message || "OAuth sign up failed. Please try again.");
      setOauthLoadingProvider(null);
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
    const trimmedEmail = email.trim();

    const nextErrors: FieldErrors = {};
    if (!trimmedName) nextErrors.fullName = "Full name is required.";
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
      return;
    }

    setIsSubmitting(true);

    try {
      const [firstName, ...rest] = trimmedName.split(/\s+/);
      const lastName = rest.join(" ");

      setUserData((prev) => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          firstName: firstName || prev.basicInfo.firstName,
          lastName,
          email: trimmedEmail,
        },
      }));

      if (!signUp) {
        setServerError("Signup not initialized. Please refresh the page.");
        return;
      }

      await signUp.create({ emailAddress: trimmedEmail, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      setResendCooldown(30);
    } catch (error: any) {
      console.error("[signup] Error:", error);
      const errorMessage =
        error.errors?.[0]?.message || error.message || "An unexpected error occurred. Please try again.";
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Form
    fullName, setFullName,
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
    oauthLoadingProvider,
    // Refs
    fullNameRef, emailRef, passwordRef, confirmPasswordRef, errorSummaryRef,
    // Meta
    fieldMeta,
    // Actions
    handleSubmit,
    handleVerification,
    handleOAuthGoogle: () => handleOAuthSignUp("oauth_google"),
    handleResendCode,
    handleRetrySyncBackend,
    handleGoToLogin,
  };
}
