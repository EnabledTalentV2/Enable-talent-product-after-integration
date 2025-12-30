"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, type FormEvent, type RefObject } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import logo from "@/public/logo/ET Logo-01.webp";
import { setPendingEmployerSignup } from "@/lib/localEmployerStore";

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

export default function SignupEmployerPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const employerNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

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

    // Proceed with signup logic
    setPendingEmployerSignup({
      email: trimmedEmail,
      password,
      fullName: trimmedName,
      employerName: trimmedEmployerName,
    });

    // Simulate API call to set HTTP-only cookie
    fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        basicInfo: { firstName: trimmedName, email: trimmedEmail },
        employerName: trimmedEmployerName,
        role: "employer",
      }),
    }).then(() => {
      router.push("/signup-employer/email-verification");
    });
  };

  return (
    <main className="min-h-screen w-full bg-[#C5D8F5] relative overflow-hidden flex items-center justify-center">
      {/* Background Curves/Blobs */}
      <div className="pointer-events-none absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-white/30 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[70px] border-white/15 blur-sm" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[560px] w-[560px] translate-x-1/3 translate-y-1/3 rounded-full border-[80px] border-white/15 blur-sm" />
      <div className="pointer-events-none absolute right-16 top-16 h-[260px] w-[260px] rounded-full bg-white/20 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-0">
        <div className="pointer-events-none absolute inset-0 rounded-[36px] border border-white/35 shadow-xl" />
        <div className="relative flex w-full flex-col items-center justify-center gap-12 px-0 py-4 md:flex-row md:gap-20">
          {/* Left Side - Welcome */}
          <div className="flex max-w-105 flex-col items-center text-center">
            <div className="relative mb-8 flex items-center justify-center">
              {/* Orange glow effect behind logo */}
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
              Welcome To Enabled Talent
            </h1>
            <p className="text-base text-gray-700 md:text-lg max-w-md">
              Find and hire top talent across Canada - faster and smarter
            </p>
          </div>

          {/* Right Side - Form */}
          <div className="w-full max-w-[460px] rounded-[32px] bg-white px-8 py-10 shadow-xl md:px-10 md:py-12">
            <div className="text-center mb-7">
              <h2 className="text-[26px] font-semibold text-gray-900 mb-2">
                Sign Up
              </h2>
              <p className="text-sm text-gray-500">
                Create an employer account to start hiring
              </p>
            </div>

            <form className="space-y-4" noValidate onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="block text-[16px] font-semibold text-gray-900">
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className={inputClasses(Boolean(fieldErrors.fullName))}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}
                  ref={fullNameRef}
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[16px] font-semibold text-gray-900">
                  Employer name
                </label>
                <input
                  type="text"
                  placeholder="Enter employer name"
                  className={inputClasses(Boolean(fieldErrors.employerName))}
                  value={employerName}
                  onChange={(e) => {
                    setEmployerName(e.target.value);
                    clearFieldError("employerName");
                  }}
                  ref={employerNameRef}
                />
                {fieldErrors.employerName && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.employerName}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[16px] font-semibold text-gray-900">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className={inputClasses(Boolean(fieldErrors.email))}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  ref={emailRef}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[16px] font-semibold text-gray-900">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className={inputClasses(Boolean(fieldErrors.password))}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError("password");
                    }}
                    ref={passwordRef}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[16px] font-semibold text-gray-900">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className={inputClasses(
                      Boolean(fieldErrors.confirmPassword)
                    )}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearFieldError("confirmPassword");
                    }}
                    ref={confirmPasswordRef}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
              >
                Create account
              </button>

              <p className="mt-2 text-center text-[11px] text-gray-400">
                Takes less than 2 minutes
              </p>
            </form>

            <div className="mt-6 text-center">
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

            <div className="mt-6 text-center text-[11px] text-gray-400">
              By clicking login, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-gray-600">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-gray-600">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
