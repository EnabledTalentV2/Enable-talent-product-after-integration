"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { AlertCircle, Loader2 } from "lucide-react";

type Portal = "talent" | "employer";

const normalizePortal = (value: string | null): Portal =>
  value === "employer" ? "employer" : "talent";

const safeNextPath = (value: string | null): string | null => {
  if (!value) return null;
  // Only allow app-internal relative paths to avoid open redirects.
  if (!value.startsWith("/")) return null;
  return value;
};

export default function AccountSetupRequiredPage() {
  return (
    <Suspense fallback={null}>
      <AccountSetupRequiredContent />
    </Suspense>
  );
}

function AccountSetupRequiredContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  const portal = useMemo(
    () => normalizePortal(searchParams.get("portal")),
    [searchParams]
  );
  const nextPath = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams]
  );

  const [signOutMode, setSignOutMode] = useState<null | "login" | "signup">(
    null
  );
  const isSigningOut = signOutMode !== null;
  const [error, setError] = useState<string | null>(null);

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";

  const completeSignupPath = useMemo(() => {
    const base =
      portal === "employer"
        ? "/signup-employer/oauth-complete"
        : "/signup/oauth-complete";

    return nextPath ? `${base}?next=${encodeURIComponent(nextPath)}` : base;
  }, [portal, nextPath]);

  const createAccountPath = useMemo(() => {
    const base = portal === "employer" ? "/signup-employer" : "/signup";
    return nextPath ? `${base}?next=${encodeURIComponent(nextPath)}` : base;
  }, [portal, nextPath]);

  const loginPath = portal === "employer" ? "/login-employer" : "/login-talent";

  useEffect(() => {
    if (!isLoaded) return;
    // If there is no Clerk session, this page isn't actionable.
    if (!isSignedIn) {
      router.replace(loginPath);
    }
  }, [isLoaded, isSignedIn, router, loginPath]);

  const handleContinueSetup = () => {
    setError(null);
    router.push(completeSignupPath);
  };

  const handleCreateNewAccount = async () => {
    setError(null);
    setSignOutMode("signup");
    try {
      await signOut();
      router.replace(createAccountPath);
    } catch (err) {
      console.error("[account/setup-required] signOut failed:", err);
      setError("Unable to sign out. Please try again.");
    } finally {
      setSignOutMode(null);
    }
  };

  const handleSignOutToLogin = async () => {
    setError(null);
    setSignOutMode("login");
    try {
      await signOut();
      router.replace(loginPath);
    } catch (err) {
      console.error("[account/setup-required] signOut failed:", err);
      setError("Unable to sign out. Please try again.");
    } finally {
      setSignOutMode(null);
    }
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#F0F5FA] px-6 py-12">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-700">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>Loading authentication status...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-[#F0F5FA] px-6 py-12">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Account setup required
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          You&apos;re signed in{email ? ` as ${email}` : ""}, but your account
          record in our system is missing or was deleted. To continue, create
          your account again and complete onboarding.
        </p>

        {error ? (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
            <AlertCircle className="mt-0.5 h-5 w-5" aria-hidden="true" />
            <div className="text-sm">{error}</div>
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleContinueSetup}
            className="w-full rounded-lg bg-orange-900 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-orange-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
          >
            Continue setup
          </button>
          <button
            type="button"
            onClick={handleCreateNewAccount}
            disabled={isSigningOut}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signOutMode === "signup" ? "Signing out..." : "Create a new account"}
          </button>
          <p className="text-center text-xs text-slate-700">
            Prefer to use a different login?{" "}
            <button
              type="button"
              onClick={handleSignOutToLogin}
              disabled={isSigningOut}
              className="font-semibold text-orange-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signOutMode === "login"
                ? "Signing out..."
                : "Sign out and go back to login"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
