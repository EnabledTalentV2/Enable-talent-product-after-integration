"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import backgroundVectorSvg from "@/public/Vector 4500.svg";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { useCandidateLoginUser } from "@/lib/hooks/useCandidateLoginUser";
import {
  ensureCandidateProfileSlug,
  fetchCandidateProfileFull,
} from "@/lib/candidateProfile";
import { mapCandidateProfileToUserData } from "@/lib/candidateProfileUtils";
import { useCandidateProfileStore } from "@/lib/candidateProfileStore";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/public/logo/ET Logo-01.webp";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loginCandidate, isLoading, error, setError } =
    useCandidateLoginUser();
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const hasError = Boolean(error);

  useEffect(() => {
    if (hasError) {
      errorSummaryRef.current?.focus();
    }
  }, [hasError]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError(null);

    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !password) {
        setError("Please enter your email and password.");
        return;
      }

      const result = await loginCandidate({
        email: trimmedEmail,
        password: password,
      });

      if (!result.data) {
        return;
      }

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

      const nextPath =
        searchParams.get("next") ?? searchParams.get("returnUrl");
      const redirectTarget =
        nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";
      router.push(redirectTarget);
    } catch (err: unknown) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <main
      id="main-content"
      className="min-h-screen w-full bg-gradient-to-br from-[#F7D877] via-[#F2BF4A] to-[#E8A426] relative overflow-hidden flex items-center justify-center"
    >
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
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/70 bg-white/85 shadow-[0_12px_24px_rgba(146,86,16,0.2)]">
                <Image
                  src={logo}
                  alt="Enabled Talent Logo"
                  className="h-12 w-12 object-contain"
                />
              </div>
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

            <form
              className="space-y-4 "
              aria-labelledby="talent-login-heading"
              noValidate
              onSubmit={handleSubmit}
            >
              {error ? (
                <div
                  ref={errorSummaryRef}
                  id="talent-login-error"
                  role="alert"
                  tabIndex={-1}
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
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
                  href="/forgot-password"
                  title="Forgot Password"
                  className="font-medium text-[#B45309] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
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

              <p className="text-[13px] text-slate-600">
                Are you an Employer?{" "}
                <Link
                  className="font-semibold text-[#B45309] hover:underline"
                  href="/login-employer"
                >
                  Log in here
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
