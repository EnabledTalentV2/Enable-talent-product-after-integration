"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import backgroundVector from "@/public/Vector 4500.png";
import { useRouter } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import {
  clearCurrentUser,
  getUserByEmail,
  setCurrentUser,
} from "@/lib/localUserStore";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/public/logo/ET Logo-01.webp";

const inputClasses =
  "w-full h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 transition-shadow placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-[#E58C3A] focus:ring-[#F6C071]/60";

export default function LoginPage() {
  const router = useRouter();
  const setUserData = useUserDataStore((s) => s.setUserData);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const hasError = Boolean(error);

  useEffect(() => {
    if (hasError) {
      errorSummaryRef.current?.focus();
    }
  }, [hasError]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !password) {
        setError("Please enter your email and password.");
        return;
      }

      clearCurrentUser();
      const storedUser = getUserByEmail(trimmedEmail);

      if (!storedUser || storedUser.password !== password) {
        setError("Invalid email or password.");
        return;
      }

      setCurrentUser(storedUser.email);
      setUserData(() => storedUser.userData);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#F7D877] via-[#F2BF4A] to-[#E8A426] relative overflow-hidden flex items-center justify-center">
      <div className="relative z-10 mx-auto w-full max-w-5xl px-0 ">
        <div className=" pointer-events-none absolute inset-0 rounded-[36px] border border-white/35 shadow-[0_20px_50px_rgba(120,72,12,0.18)]" />
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
                    className={inputClasses}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={password}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? "talent-login-error" : undefined}
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E58C3A]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#B45309] to-[#E57E25] py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(182,97,35,0.35)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E58C3A] focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-[13px] text-slate-600">
                Already have an account?{" "}
                <Link
                  className="font-semibold text-[#E85D04] hover:underline"
                  href="/signup"
                >
                  Sign up
                </Link>
              </p>

              <p className="text-[11px] text-slate-400">
                By clicking login, you agree to our{" "}
                <Link href="#" className="underline hover:text-slate-600">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="underline hover:text-slate-600">
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
