"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { useSignIn, useAuth, useUser } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import { useCandidateProfileStore } from "@/lib/candidateProfileStore";
import { apiRequest, isSessionExpiredError, isApiError } from "@/lib/api-client";
import { deriveUserRoleFromUserData } from "@/lib/roleUtils";
import { loadCandidateProfileAndSync } from "@/lib/helpers/loadCandidateProfile";

export function useTalentLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patchUserData = useUserDataStore((s) => s.patchUserData);
  const setCandidateProfile = useCandidateProfileStore((s) => s.setProfile);
  const setCandidateSlug = useCandidateProfileStore((s) => s.setSlug);
  const setCandidateLoading = useCandidateProfileStore((s) => s.setLoading);
  const setCandidateError = useCandidateProfileStore((s) => s.setError);
  const resetCandidateProfile = useCandidateProfileStore((s) => s.reset);
  const { signIn, setActive } = useSignIn();
  const { userId, signOut, isLoaded, getToken } = useAuth();
  const { user } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionAlreadyExists, setSessionAlreadyExists] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const warningSummaryRef = useRef<HTMLDivElement | null>(null);
  const backendCheckedRef = useRef(false);
  const [roleWarning, setRoleWarning] = useState<string | null>(null);
  const [needsSync, setNeedsSync] = useState(false);
  const [clerkUserId, setClerkUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [syncRetryCount, setSyncRetryCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const hasError = Boolean(error);
  const hasWarning = Boolean(roleWarning);
  const syncReason = searchParams.get("reason");
  const authError = searchParams.get("error");
  const nextPath = searchParams.get("next") ?? searchParams.get("returnUrl");
  const continuePath =
    nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard/home";
  const hasExistingSession = Boolean(userId) || sessionAlreadyExists;
  const setupRequiredPath = `/account/setup-required?portal=talent${
    nextPath && nextPath.startsWith("/")
      ? `&next=${encodeURIComponent(nextPath)}`
      : ""
  }`;

  const profileStores = {
    resetProfile: resetCandidateProfile,
    setSlug: setCandidateSlug,
    setProfile: setCandidateProfile,
    setLoading: setCandidateLoading,
    setError: setCandidateError,
    patchUserData,
  };

  // Preload Clerk identity when user is already signed in (e.g. after OAuth redirect)
  useEffect(() => {
    if (!userId) return;

    const emailFromClerk =
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      null;

    if (!clerkUserId) {
      setClerkUserId(userId);
    }

    if (emailFromClerk && !userEmail) {
      setUserEmail(emailFromClerk);
    }

    if (!email && emailFromClerk) {
      setEmail(emailFromClerk);
    }
  }, [userId, user, clerkUserId, userEmail, email]);

  // Check existing session on mount — redirect candidates, warn employers
  useEffect(() => {
    if (!userId) return;
    if (backendCheckedRef.current) return;
    if (isLoading) return;
    backendCheckedRef.current = true;

    setIsCheckingSession(true);
    void apiRequest<unknown>("/api/user/me", { method: "GET" })
      .then((userData) => {
        const derivedRole = deriveUserRoleFromUserData(userData);
        if (derivedRole === "employer") {
          setIsCheckingSession(false);
          setNeedsSync(false);
          setError(null);
          setRoleWarning(
            "You are currently signed in as an Employer. Please continue from the Employer login."
          );
          return;
        }

        if (derivedRole === "candidate") {
          router.replace(continuePath);
          return;
        }

        setIsCheckingSession(false);
      })
      .catch((err) => {
        setIsCheckingSession(false);
        if (isApiError(err) && (err.status === 401 || err.status === 403)) {
          router.replace(setupRequiredPath);
          return;
        }
      });
  }, [userId, router, continuePath, setupRequiredPath]);

  // Legacy: redirect to setup-required if backend_user_missing reason
  useEffect(() => {
    if (syncReason !== "backend_user_missing") return;
    if (!userId) return;
    router.replace(setupRequiredPath);
  }, [syncReason, userId, router, setupRequiredPath]);

  // Handle wrong_role error from URL params
  useEffect(() => {
    if (authError !== "wrong_role") return;
    setNeedsSync(false);
    setError(null);
    setRoleWarning(
      "This is an Employer account. Please log in from the Employer section. If you're a talent, use your talent account or create one."
    );
  }, [authError]);

  // Focus management on error/warning
  useEffect(() => {
    if (hasWarning) {
      warningSummaryRef.current?.focus();
    } else if (hasError) {
      errorSummaryRef.current?.focus();
    }
  }, [hasError, hasWarning]);

  const handleOAuthSignIn = async (strategy: OAuthStrategy) => {
    if (!signIn) {
      setError("Login not initialized yet. Please refresh the page and try again.");
      return;
    }

    if (!isLoaded) {
      setError("Loading authentication state... please wait a moment and try again.");
      return;
    }

    if (hasExistingSession) {
      setSessionAlreadyExists(true);
      if (needsSync) {
        setError(
          "You're already signed in, but your account isn't synced yet. Please click 'Sync Account' below."
        );
      } else if (roleWarning) {
        setError(
          "This browser already has an Employer session. Use Employer Login or sign out first."
        );
      } else {
        setError(null);
      }
      return;
    }
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/login-talent",
      });
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || err?.message || "";
      const normalized = String(message).toLowerCase();
      if (
        normalized.includes("already signed in") ||
        normalized.includes("session already exists")
      ) {
        setSessionAlreadyExists(true);
        setError(null);
        return;
      }

      console.error("[login-talent] OAuth error:", err);
      setError(message || "OAuth login failed. Please try again.");
    }
  };

  const handleSyncAccount = async () => {
    if (!clerkUserId || !userEmail) {
      setError("Missing user information. Please try logging in again.");
      return;
    }

    setIsSyncing(true);
    setError(null);

    const MAX_ATTEMPTS = 3;
    let delayMs = 1000;

    try {
      let syncSucceeded = false;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        setSyncRetryCount(attempt);
        try {
          const freshToken = await getToken({ template: "api", skipCache: true });
          if (!freshToken) throw new Error("Could not obtain Clerk JWT");

          await apiRequest("/api/auth/clerk-sync", {
            method: "POST",
            body: JSON.stringify({
              clerk_user_id: clerkUserId,
              email: userEmail,
              token: freshToken,
            }),
          });
          syncSucceeded = true;
          break;
        } catch (err) {
          console.error(`[login-talent] Sync attempt ${attempt}/${MAX_ATTEMPTS} failed:`, err);
          if (attempt < MAX_ATTEMPTS) {
            setError(`Syncing account (attempt ${attempt}/${MAX_ATTEMPTS})...`);
            await new Promise((r) => setTimeout(r, delayMs));
            delayMs = Math.min(Math.round(delayMs * 1.5), 4000);
          }
        }
      }

      if (!syncSucceeded) {
        setError(
          "Account sync failed after multiple attempts. You're being signed out. Please try again later."
        );
        setNeedsSync(false);
        try {
          await signOut();
        } catch (err) {
          console.error("[login-talent] signOut failed after sync failures:", err);
        } finally {
          setClerkUserId(null);
          setUserEmail(null);
          setSyncRetryCount(0);
          backendCheckedRef.current = false;
        }
        return;
      }

      const userData = await apiRequest<unknown>("/api/user/me", { method: "GET" });
      const derivedRole = deriveUserRoleFromUserData(userData);

      if (derivedRole === "employer") {
        setRoleWarning(
          "This is an Employer account. Please log in from the Employer section. If you're a talent, use your talent account or create one."
        );
        setNeedsSync(false);
        setIsSyncing(false);
        return;
      }

      await loadCandidateProfileAndSync(profileStores, "Login Talent (Sync)");

      const redirectNext = searchParams.get("next") ?? searchParams.get("returnUrl");
      const redirectTarget =
        redirectNext && redirectNext.startsWith("/") ? redirectNext : "/dashboard/home";
      router.push(redirectTarget);
    } catch (error: any) {
      console.error("[login-talent] Sync failed:", error);
      setError("Account sync failed. Please try again later.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setRoleWarning(null);
    setNeedsSync(false);
    setClerkUserId(null);
    setUserEmail(null);
    setSyncRetryCount(0);
    backendCheckedRef.current = false;

    try {
      await signOut();
    } catch (err) {
      console.error("[login-talent] signOut failed:", err);
      setError("Unable to sign out. Please refresh and try again.");
    }
  };

  const completeLoginAfterClerk = async (sessionId: string | null, loginEmail: string) => {
    if (!sessionId) {
      setError("Session could not be created. Please try again.");
      return;
    }
    await setActive?.({ session: sessionId });

    await new Promise((r) => setTimeout(r, 500));

    setClerkUserId(userId ?? null);
    setUserEmail(loginEmail);

    try {
      const userData = await apiRequest<unknown>("/api/user/me", { method: "GET" });
      const derivedRole = deriveUserRoleFromUserData(userData);

      if (derivedRole === "employer") {
        setRoleWarning(
          "This is an Employer account. Please log in from the Employer section. If you're a talent, use your talent account or create one."
        );
        return;
      }
    } catch (userMeError: any) {
      console.log("[login-talent] /api/user/me error caught:", {
        error: userMeError,
        isApiError: isApiError(userMeError),
        isSessionExpired: isSessionExpiredError(userMeError),
        status: userMeError?.status,
        message: userMeError?.message,
      });

      if (isSessionExpiredError(userMeError)) {
        throw userMeError;
      }

      const isBackendUserMissing =
        isApiError(userMeError) &&
        (userMeError.status === 401 || userMeError.status === 403);

      if (isBackendUserMissing) {
        console.log(
          "[login-talent] Backend user missing/deleted - redirecting to setup required"
        );
        router.replace(setupRequiredPath);
        return;
      }
      throw userMeError;
    }

    await loadCandidateProfileAndSync(profileStores, "Login Talent");

    const next = searchParams.get("next") ?? searchParams.get("returnUrl");
    const redirectTarget =
      next && next.startsWith("/") ? next : "/dashboard/home";
    router.push(redirectTarget);
  };

  const handleVerification = async () => {
    if (!signIn || !verificationCode.trim()) return;
    setIsVerifying(true);
    setError(null);

    try {
      let result;
      try {
        result = await signIn.attemptSecondFactor({
          strategy: "email_code" as any,
          code: verificationCode,
        });
      } catch {
        result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: verificationCode,
        });
      }

      if (result.status === "complete") {
        setPendingVerification(false);
        setIsLoading(true);
        await completeLoginAfterClerk(result.createdSessionId, email.trim());
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("[login-talent] Verification error:", err);
      const errorMessage =
        err.errors?.[0]?.message ||
        err.message ||
        "Invalid verification code. Please try again.";
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) return;

    if (!isLoaded) {
      setError("Loading authentication state... please wait a moment and try again.");
      return;
    }

    if (hasExistingSession) {
      if (needsSync) {
        setError(
          "You're already signed in, but your account isn't synced yet. Please click 'Sync Account' below."
        );
      } else if (roleWarning) {
        setError(
          "This browser already has an Employer session. Use Employer Login or sign out first."
        );
      } else {
        setError("You're already signed in. Please wait while we redirect you.");
      }
      return;
    }

    setError(null);
    setRoleWarning(null);
    setIsLoading(true);

    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !password) {
        setError("Please enter your email and password.");
        setIsLoading(false);
        return;
      }

      if (!signIn) {
        setError("Login not initialized. Please refresh the page.");
        setIsLoading(false);
        return;
      }

      let clerkSignInResult;
      try {
        clerkSignInResult = await signIn.create({
          identifier: trimmedEmail,
          password: password,
        });
      } catch (signInErr: any) {
        const signInCode = signInErr?.errors?.[0]?.code;
        if (signInCode === "strategy_for_user_invalid") {
          setError(
            "This account doesn't have a password yet. Please sign in with Google/GitHub, or use 'Forgot password' to set one."
          );
          return;
        }

        const msg = String(
          signInErr?.errors?.[0]?.message || signInErr?.message || ""
        ).toLowerCase();

        if (msg.includes("already signed in") || msg.includes("session already exists")) {
          setSessionAlreadyExists(true);
          setIsCheckingSession(true);
          setError(null);

          try {
            const userData = await apiRequest<unknown>("/api/user/me", { method: "GET" });
            const derivedRole = deriveUserRoleFromUserData(userData);
            if (derivedRole === "candidate") {
              router.replace(continuePath);
              return;
            }
            if (derivedRole === "employer") {
              setIsCheckingSession(false);
              setRoleWarning(
                "This is an Employer account. Please log in from the Employer section."
              );
              return;
            }
            setIsCheckingSession(false);
          } catch {
            setIsCheckingSession(false);
          }
          return;
        }
        throw signInErr;
      }

      if (
        clerkSignInResult.status === "needs_first_factor" ||
        clerkSignInResult.status === "needs_second_factor"
      ) {
        const isSecondFactor = clerkSignInResult.status === "needs_second_factor";
        try {
          if (isSecondFactor) {
            await signIn!.prepareSecondFactor({
              strategy: "email_code" as any,
            });
          } else {
            const emailFactor = (clerkSignInResult.supportedFirstFactors ?? []).find(
              (f: any) => f.strategy === "email_code"
            ) as any;
            if (emailFactor) {
              await signIn!.prepareFirstFactor({
                strategy: "email_code",
                emailAddressId: emailFactor.emailAddressId,
              });
            } else {
              setError("Email verification is required but not available. Please contact support.");
              return;
            }
          }
        } catch (prepErr: any) {
          console.error("[login-talent] Failed to prepare verification:", prepErr);
          setError("Failed to send verification code. Please try again.");
          return;
        }

        setPendingVerification(true);
        setVerificationCode("");
        setError(null);
        return;
      }

      if (clerkSignInResult.status !== "complete") {
        setError("Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      await completeLoginAfterClerk(clerkSignInResult.createdSessionId, trimmedEmail);
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.errors?.[0]?.message ||
        err.message ||
        "Something went wrong. Please try again.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelVerification = () => {
    setPendingVerification(false);
    setVerificationCode("");
    setError(null);
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  return {
    // Form
    email,
    password,
    showPassword,
    verificationCode,
    setEmail,
    setPassword,
    togglePassword,
    setVerificationCode,
    // Status
    isLoading,
    isCheckingSession,
    isSyncing,
    pendingVerification,
    isVerifying,
    hasExistingSession,
    needsSync,
    hasError,
    error,
    roleWarning,
    syncRetryCount,
    continuePath,
    isLoaded: isLoaded ?? false,
    // Actions
    handleSubmit,
    handleOAuthGoogle: () => handleOAuthSignIn("oauth_google"),
    handleSyncAccount,
    handleSignOut,
    handleVerification,
    cancelVerification,
    // Refs
    errorSummaryRef,
    warningSummaryRef,
  };
}
