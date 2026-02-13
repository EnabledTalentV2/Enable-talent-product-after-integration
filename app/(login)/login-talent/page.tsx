"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import backgroundVectorSvg from "@/public/Vector 4500.svg";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { useSignIn, useAuth, useUser } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import {
  ensureCandidateProfileSlug,
  fetchCandidateProfileFull,
} from "@/lib/candidateProfile";
import { mapCandidateProfileToUserData } from "@/lib/candidateProfileUtils";
import { useCandidateProfileStore } from "@/lib/candidateProfileStore";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import logo from "@/public/logo/ET Logo-01.webp";
import { apiRequest, isSessionExpiredError, isApiError } from "@/lib/api-client";
import { deriveUserRoleFromUserData } from "@/lib/roleUtils";

const inputClasses =
  "w-full h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 transition-shadow placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-[#E58C3A] focus:ring-[#F6C071]/60";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patchUserData = useUserDataStore((s) => s.patchUserData);
  const setCandidateProfile = useCandidateProfileStore((s) => s.setProfile);
  const setCandidateSlug = useCandidateProfileStore((s) => s.setSlug);
  const setCandidateLoading = useCandidateProfileStore((s) => s.setLoading);
  const setCandidateError = useCandidateProfileStore((s) => s.setError);
  const resetCandidateProfile = useCandidateProfileStore((s) => s.reset);
  const { signIn, setActive } = useSignIn();
  const { userId, signOut, isLoaded } = useAuth();
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
  const hasError = Boolean(error);
  const hasWarning = Boolean(roleWarning);
  const syncReason = searchParams.get("reason");
  const authError = searchParams.get("error");
  const nextPath = searchParams.get("next") ?? searchParams.get("returnUrl");
  const continuePath =
    nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard/home";
  const hasExistingSession = Boolean(userId) || sessionAlreadyExists;

  // If user is already signed in (common after OAuth redirect) but missing in Django,
  // preload Clerk identity so the "Sync Account" action can run.
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

  useEffect(() => {
    if (!userId) return;
    if (backendCheckedRef.current) return;
    // Don't run this during an active login — handleSubmit handles its own redirect
    if (isLoading) return;
    backendCheckedRef.current = true;

    // If user isn't in Django yet, prompt for sync.
    // If this session belongs to an employer, show wrong-portal guidance.
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
          // Keep isCheckingSession true — we're redirecting away
          router.replace(continuePath);
          return;
        }

        // Unknown role — stop checking so the user can act
        setIsCheckingSession(false);
      })
      .catch((err) => {
        setIsCheckingSession(false);
        if (isApiError(err) && err.status === 401) {
          setNeedsSync(true);
          setError(
            (prev) =>
              prev ??
              "Looks like your account data is missing. Please click 'Sync Account' to complete your login."
          );
        }
      });
  }, [userId, router, continuePath]);

  useEffect(() => {
    if (syncReason !== "backend_user_missing") return;
    if (!userId) return;
    setNeedsSync(true);
    setError(
      (prev) =>
        prev ??
      "Looks like your account data is missing. Please click 'Sync Account' to complete your login."
    );
  }, [syncReason, userId]);

  useEffect(() => {
    if (authError !== "wrong_role") return;
    setNeedsSync(false);
    setError(null);
    setRoleWarning(
      "This is an Employer account. Please log in from the Employer section. If you're a talent, use your talent account or create one."
    );
  }, [authError]);

  const handleOAuthSignIn = async (strategy: OAuthStrategy) => {
    if (!signIn) {
      setError("Login not initialized yet. Please refresh the page and try again.");
      return;
    }

    // Prevent Clerk throwing "You're already signed in." if the user clicks quickly.
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
        // Show the "already signed in" banner instead of an error.
        setError(null);
      }
      return;
    }
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard/home",
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

    const attemptNumber = syncRetryCount + 1;
    if (attemptNumber > 2) {
      setError(
        "Maximum sync attempts reached. Please try again later or contact support."
      );
      setNeedsSync(false);
      try {
        await signOut();
      } catch (err) {
        console.error("[login-talent] signOut failed after max attempts:", err);
      }
      return;
    }

    setIsSyncing(true);
    setError(null);
    setSyncRetryCount(attemptNumber);

    try {
      // Call clerk-sync to create Django user
      await apiRequest("/api/auth/clerk-sync", {
        method: "POST",
        body: JSON.stringify({
          clerk_user_id: clerkUserId,
          email: userEmail,
        }),
      });

      // Sync succeeded - now get user data and continue login
      const userData = await apiRequest<unknown>("/api/user/me", {
        method: "GET",
      });
      const derivedRole = deriveUserRoleFromUserData(userData);

      if (derivedRole === "employer") {
        setRoleWarning(
          "This is an Employer account. Please log in from the Employer section. If you're a talent, use your talent account or create one."
        );
        setNeedsSync(false);
        setIsSyncing(false);
        return;
      }

      // Load candidate profile
      resetCandidateProfile();
      setCandidateLoading(true);
      setCandidateError(null);
      try {
        const slug = await ensureCandidateProfileSlug({
          logLabel: "Login Talent (Sync)",
        });
        if (slug) {
          setCandidateSlug(slug);
          const profile = await fetchCandidateProfileFull(slug, "Login Talent (Sync)");
          if (profile) {
            setCandidateProfile(profile);
            const mapped = mapCandidateProfileToUserData(profile);
            if (Object.keys(mapped).length > 0) {
              patchUserData(mapped);
            }
          } else {
            setCandidateError("Unable to load candidate profile.");
          }
        } else {
          setCandidateError("Unable to load candidate profile.");
        }
      } finally {
        setCandidateLoading(false);
      }

      // Redirect to dashboard
      const nextPath =
        searchParams.get("next") ?? searchParams.get("returnUrl");
      const redirectTarget =
        nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard/home";
      router.push(redirectTarget);
    } catch (error: any) {
      console.error("[login-talent] Sync failed:", error);
      const attemptsRemaining = 2 - attemptNumber;

      if (attemptsRemaining > 0) {
        setError(
          `Account sync failed. You have ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining.`
        );
      } else {
        setError(
          "Account sync failed twice. You're being signed out. Please try again later."
        );
        setNeedsSync(false);
        try {
          await signOut();
        } catch (err) {
          console.error("[login-talent] signOut failed after sync failures:", err);
        } finally {
          // Clear local state so the login form is usable again without a refresh.
          setClerkUserId(null);
          setUserEmail(null);
          setSyncRetryCount(0);
          backendCheckedRef.current = false;
        }
      }
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

  useEffect(() => {
    if (hasWarning) {
      warningSummaryRef.current?.focus();
    } else if (hasError) {
      errorSummaryRef.current?.focus();
    }
  }, [hasError, hasWarning]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

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

      // Step 1: Sign in with Clerk
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
          // Session exists from another tab — skip Clerk sign-in, go straight to redirect
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
        // Not a session error — rethrow to outer catch
        throw signInErr;
      }

      if (clerkSignInResult.status !== "complete") {
        setError("Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Step 2: Set the active session
      await setActive({ session: clerkSignInResult.createdSessionId });

      // Give Clerk a moment to propagate the session cookie to the server
      await new Promise((r) => setTimeout(r, 500));

      // Store Clerk user info for potential sync
      // Clerk types don't expose createdUserId on SignInResource; rely on useAuth().userId instead.
      setClerkUserId(userId ?? null);
      setUserEmail(trimmedEmail);

      // Step 3: Get user data from Django to check role
      try {
        const userData = await apiRequest<unknown>("/api/user/me", {
          method: "GET",
        });
        const derivedRole = deriveUserRoleFromUserData(userData);

        if (derivedRole === "employer") {
          setRoleWarning(
            "This is an Employer account. Please log in from the Employer section. If you're a talent, use your talent account or create one."
          );
          setIsLoading(false);
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

        // If it's a session expired error, re-throw it (authentication issue)
        if (isSessionExpiredError(userMeError)) {
          console.log("[login-talent] Session expired, re-throwing");
          throw userMeError;
        }

        // Check if it's a 401 ApiError (user not in Django)
        // This happens when user exists in Clerk but not in backend
        const is401 = isApiError(userMeError) && userMeError.status === 401;

        console.log("[login-talent] 401 check:", {is401, isApiError: isApiError(userMeError), status: userMeError?.status});
        console.log("[login-talent] About to check if (is401), value:", is401, typeof is401);

        if (is401) {
          console.log("[login-talent] INSIDE IF BLOCK - User exists in Clerk but not in Django - showing sync button");
          setNeedsSync(true);
          setError("Looks like your account data is missing. Please click 'Sync Account' to complete your login.");
          setIsLoading(false);
          return;
        }
        // Re-throw other errors
        console.log("[login-talent] Not a 401, re-throwing error");
        throw userMeError;
      }

      // Step 4: Load candidate profile
      resetCandidateProfile();
      setCandidateLoading(true);
      setCandidateError(null);
      try {
        const slug = await ensureCandidateProfileSlug({
          logLabel: "Login Talent",
        });
        if (slug) {
          setCandidateSlug(slug);
          const profile = await fetchCandidateProfileFull(slug, "Login Talent");
          if (profile) {
            setCandidateProfile(profile);
            const mapped = mapCandidateProfileToUserData(profile);
            if (Object.keys(mapped).length > 0) {
              patchUserData(mapped);
            }
          } else {
            setCandidateError("Unable to load candidate profile.");
          }
        } else {
          setCandidateError("Unable to load candidate profile.");
        }
      } finally {
        setCandidateLoading(false);
      }

      // Step 5: Redirect to dashboard
      const nextPath =
        searchParams.get("next") ?? searchParams.get("returnUrl");
      const redirectTarget =
        nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard/home";
      router.push(redirectTarget);
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

  return (
    <main
      id="main-content"
      className="min-h-screen w-full bg-gradient-to-br from-[#F7D877] via-[#F2BF4A] to-[#E8A426] relative overflow-hidden flex flex-col items-center md:justify-center"
    >
      <div className="w-full p-6 z-30 flex justify-start md:absolute md:top-0 md:left-0">
        <a
          href="https://www.enabledtalent.com/"
          className="group flex items-center gap-2 text-sm font-medium text-slate-900 transition-colors hover:text-[#8C4A0A] bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C4A0A] focus-visible:ring-offset-2"
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
      <div className="relative z-10 mx-auto w-full max-w-5xl px-0 ">
        <div className=" pointer-events-none absolute inset-0 rounded-[36px] border border-white/35 bg-gradient-to-br from-[#F7D877]/90 via-[#F2BF4A]/90 to-[#E8A426]/90 backdrop-blur-sm shadow-[0_20px_50px_rgba(120,72,12,0.18)]" />
        <div className="relative flex w-full flex-col items-center justify-center gap-12 px-0 py-4 md:flex-row md:gap-20">
          {/* Left Side Content */}
          <div className="flex max-w-105 flex-col items-center text-center ">
            <div className="relative mb-8 flex items-center justify-center">
              {/* Golden aura behind logo */}
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
              Welcome To Enabled Talent
            </h1>
            <p className="text-base text-slate-800 md:text-lg">
              Because every talent deserves the right chance
            </p>
          </div>

          {/* Right Side Card */}
          <div className="w-full max-w-[460px] rounded-[32px] bg-white px-8 py-10 shadow-[0_25px_60px_rgba(120,72,12,0.18)] md:px-10 md:py-12">
            <div className="text-center mb-7">
              <h2
                id="talent-login-heading"
                className="text-[26px] font-semibold text-slate-900 mb-2"
              >
                Login
              </h2>
              <p className="text-sm text-slate-500">
                Log in to your Talent account
              </p>
            </div>

            {/* OAuth Login Buttons */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleOAuthSignIn("oauth_google")}
                disabled={!isLoaded || hasExistingSession}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E58C3A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
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
                className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E58C3A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
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

              {hasExistingSession && !needsSync && !roleWarning && !isLoading && isCheckingSession ? (
                <div
                  id="talent-login-redirecting"
                  role="status"
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                >
                  <p>You're already signed in. Redirecting to your dashboard...</p>
                </div>
              ) : null}

              {hasExistingSession && !needsSync && !roleWarning && !isLoading && !isCheckingSession ? (
                <div
                  id="talent-login-already-signed-in"
                  role="status"
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                >
                  <p>
                    You're already signed in in this browser. Continue to your
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
                          ? `Syncing... (${2 - syncRetryCount} attempt${2 - syncRetryCount === 1 ? '' : 's'} left)`
                          : `Sync Account (${2 - syncRetryCount} attempt${2 - syncRetryCount === 1 ? '' : 's'} left)`}
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
                    aria-describedby={
                      hasError ? "talent-login-error" : undefined
                    }
                    aria-required="true"
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
                <Link
                  className="font-semibold text-[#B45309] hover:underline"
                  href="/signup"
                >
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
          </div>
        </div>
      </div>
      <div className="mt-8 relative z-20 rounded-[24px] border border-white/50 bg-gradient-to-br from-[#fff8e1]/95 via-[#ffecb3]/95 to-[#ffe082]/95 backdrop-blur-sm shadow-[0_10px_25px_rgba(120,72,12,0.10)]">
        <p className="px-8 py-3 text-[14px] font-medium text-slate-900 text-center">
          Are you an Employer?{" "}
          <Link
            className="font-bold text-[#8C4A0A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C4A0A] focus-visible:ring-offset-2 focus-visible:ring-offset-amber-300 rounded-sm"
            href="/login-employer"
            aria-label="Log in here to the Employer portal"
          >
            Log in here!
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
