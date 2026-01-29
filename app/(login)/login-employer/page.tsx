"use client";

import Image from "next/image";
import Link from "next/link";
import backgroundVectorSvg from "@/public/Vector 4500.svg";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import logo from "@/public/logo/ET Logo-01.webp";
import { useEmployerDataStore } from "@/lib/employerDataStore";
import { useLoginUser } from "@/lib/hooks/useLoginUser";
import { apiRequest, getApiErrorMessage } from "@/lib/api-client";
import { toEmployerOrganizationInfo } from "@/lib/organizationUtils";
import { deriveUserRoleFromUserData } from "@/lib/roleUtils";

const inputClasses =
  "w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 transition-shadow placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-orange-500 focus:ring-orange-500";

function EmployerLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setEmployerData = useEmployerDataStore((s) => s.setEmployerData);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser, isLoading, error, setError } = useLoginUser();
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const warningSummaryRef = useRef<HTMLDivElement | null>(null);
  const [roleWarning, setRoleWarning] = useState<string | null>(null);
  const hasError = Boolean(error);
  const hasWarning = Boolean(roleWarning);
  const isSubmitting = isLoading || isBootstrapping;

  useEffect(() => {
    if (hasWarning) {
      warningSummaryRef.current?.focus();
    } else if (hasError) {
      errorSummaryRef.current?.focus();
    }
  }, [hasError, hasWarning]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);
    setRoleWarning(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsBootstrapping(true);

    try {
      await apiRequest<unknown>("/api/auth/csrf", { method: "GET" });

      const result = await loginUser({
        email: trimmedEmail,
        password: password,
      });

      if (!result.data) {
        return;
      }

      const userData = await apiRequest<unknown>("/api/user/me", {
        method: "GET",
      });
      const derivedRole = deriveUserRoleFromUserData(userData);
      if (derivedRole === "candidate") {
        try {
          await apiRequest("/api/auth/logout", { method: "POST" });
        } catch (logoutError) {
          console.warn("[Employer Login] Logout failed:", logoutError);
        }
        setRoleWarning(
          "This is a Talent account. Please log in from the Talent section. If you're an employer, use your employer account or create one.",
        );
        return;
      }

      const organizations = await apiRequest<unknown>("/api/organizations", {
        method: "GET",
      });
      const organizationInfo = toEmployerOrganizationInfo(organizations);
      if (organizationInfo) {
        setEmployerData((prev) => ({
          ...prev,
          organizationInfo: {
            ...prev.organizationInfo,
            ...organizationInfo,
          },
        }));
      }

      const nextPath =
        searchParams.get("next") ?? searchParams.get("returnUrl");
      const redirectTarget =
        nextPath && nextPath.startsWith("/employer")
          ? nextPath
          : "/employer/dashboard";
      router.push(redirectTarget);
    } catch (err: unknown) {
      console.error(err);
      setError(
        getApiErrorMessage(err, "Something went wrong. Please try again."),
      );
    } finally {
      setIsBootstrapping(false);
    }
  };

  return (
    <main
      id="main-content"
      className="min-h-screen w-full bg-[#C5D8F5] relative overflow-hidden flex flex-col items-center md:justify-center"
    >
      <div className="w-full p-6 z-30 flex justify-start md:absolute md:top-0 md:left-0">
        <a
          href="https://enabled-talent-landing-v2.vercel.app/"
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
              <div className="pointer-events-none absolute -inset-8 rounded-full bg-orange-400/50 blur-3xl" />
              <div className="pointer-events-none absolute -inset-3 rounded-full bg-orange-400/70 blur-2xl" />
              <a
                href="https://enabled-talent-landing-v2.vercel.app/"
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
              Welcome Back
            </h1>
            <p className="text-base text-gray-700 md:text-lg max-w-md">
              Log in to manage your job postings and find top talent.
            </p>
          </div>

          {/* Right Side - Form */}
          <div className="w-full max-w-[460px] rounded-[32px] bg-white px-8 py-10 shadow-xl md:px-10 md:py-12">
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
              {error ? (
                <div
                  ref={errorSummaryRef}
                  id="employer-login-error"
                  role="alert"
                  tabIndex={-1}
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
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
              </div>

              <div className="flex justify-end text-[13px]">
                <Link
                  href="/forgot-password"
                  title="Forgot Password"
                  className="text-[#C04622] font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-[13px] text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup-employer"
                  className="text-[#C04622] font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 relative z-20 rounded-[24px] border border-white/50 bg-gradient-to-br from-[#eef6ff]/95 via-[#f5faff]/95 to-[#ffffff]/95 backdrop-blur-sm shadow-[0_10px_25px_rgba(30,58,138,0.10)]">
        <p className="px-8 py-3 text-[14px] font-medium text-slate-900 text-center">
          Are you a Candidate?{" "}
          <Link
            className="font-bold text-[#C04622] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C04622] focus-visible:ring-offset-2 focus-visible:ring-offset-blue-100 rounded-sm"
            href="/login-talent"
            aria-label="Log in here to the Candidate portal"
          >
            Log in here!
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function EmployerLoginPage() {
  return (
    <Suspense fallback={null}>
      <EmployerLoginPageContent />
    </Suspense>
  );
}
