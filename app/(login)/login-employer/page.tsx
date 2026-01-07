"use client";

import Image from "next/image";
import Link from "next/link";
import backgroundVectorSvg from "@/public/Vector 4500.svg";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import logo from "@/public/logo/ET Logo-01.webp";
import { useEmployerDataStore } from "@/lib/employerDataStore";
import { useLoginUser } from "@/lib/hooks/useLoginUser";
import { apiRequest, getApiErrorMessage } from "@/lib/api-client";
import { toEmployerOrganizationInfo } from "@/lib/organizationUtils";

const inputClasses =
  "w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 transition-shadow placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-orange-500 focus:ring-orange-500";

export default function EmployerLoginPage() {
  const router = useRouter();
  const setEmployerData = useEmployerDataStore((s) => s.setEmployerData);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser, isLoading, error, setError } = useLoginUser();
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const hasError = Boolean(error);
  const isSubmitting = isLoading || isBootstrapping;

  useEffect(() => {
    if (hasError) {
      errorSummaryRef.current?.focus();
    }
  }, [hasError]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);

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

      await apiRequest<unknown>("/api/user/me", { method: "GET" });

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

      router.push("/employer/dashboard");
    } catch (err: unknown) {
      console.error(err);
      setError(
        getApiErrorMessage(err, "Something went wrong. Please try again.")
      );
    } finally {
      setIsBootstrapping(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#C5D8F5] relative overflow-hidden flex items-center justify-center">
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
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm p-4">
                <Image
                  src={logo}
                  alt="Enabled Talent Logo"
                  width={60}
                  height={60}
                  className="h-12 w-12 object-contain"
                />
              </div>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
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

            <div className="mt-6 text-center">
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
    </main>
  );
}
