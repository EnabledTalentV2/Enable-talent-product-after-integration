"use client";

import { useRef, useState, type FormEvent, type RefObject } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { setPendingSignup } from "@/lib/localUserStore";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/public/logo/ET Logo-01.webp";

const inputClasses = (hasError?: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-gray-200 focus:border-[#E85D04] focus:ring-[#E85D04]"
  }`;

type FieldErrors = Partial<{
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}>;

export default function SignUpPage() {
  const router = useRouter();
  const setUserData = useUserDataStore((s) => s.setUserData);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const fullNameRef = useRef<HTMLInputElement | null>(null);
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
    const trimmedEmail = email.trim();

    const nextErrors: FieldErrors = {};
    if (!trimmedName) {
      nextErrors.fullName = "Full name is required.";
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

    setPendingSignup({ email: trimmedEmail, password });
    router.push("/signup/resume-upload");
  };

  return (
    <main className="min-h-screen w-full bg-[#FCD34D] relative overflow-hidden flex items-center justify-center">
      {/* Background Curves/Blobs */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border-[60px] border-white/10 -translate-x-1/2 blur-sm pointer-events-none" />
      <div className="absolute right-0 bottom-0 w-[600px] h-[600px] rounded-full border-[80px] border-white/10 translate-x-1/3 translate-y-1/3 blur-sm pointer-events-none" />

      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 relative z-10">
        {/* Left Side Content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-lg">
          <div className="relative mb-8 flex items-center justify-center">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 bg-[#E85D04] blur-3xl opacity-40 rounded-full scale-150"></div>
            <div className="relative h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Image
                src={logo}
                alt="Enabled Talent Logo"
                className="h-16 w-16 object-contain"
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Welcome To Enabled Talent
          </h1>
          <p className="text-lg md:text-xl text-slate-800 font-medium">
            Because every talent deserves the right chance
          </p>
        </div>

        {/* Right Side Card */}
        <div className="w-full max-w-[480px] bg-white rounded-[40px] p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign Up</h2>
            <p className="text-slate-500">
              Create a Talent account to start applying
            </p>
          </div>

          <form className="space-y-5" noValidate onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label
                className="block text-sm font-bold text-slate-900"
                htmlFor="fullname"
              >
                Full name
              </label>
              <input
                className={inputClasses(Boolean(fieldErrors.fullName))}
                id="fullname"
                name="fullname"
                type="text"
                autoComplete="name"
                placeholder="Enter full name"
                value={fullName}
                ref={fullNameRef}
                aria-invalid={Boolean(fieldErrors.fullName)}
                aria-describedby={
                  fieldErrors.fullName ? "fullname-error" : undefined
                }
                onChange={(event) => {
                  setFullName(event.target.value);
                  clearFieldError("fullName");
                }}
                required
              />
              {fieldErrors.fullName ? (
                <p id="fullname-error" className="text-sm text-red-600">
                  {fieldErrors.fullName}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                className="block text-sm font-bold text-slate-900"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className={inputClasses(Boolean(fieldErrors.email))}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter email"
                value={email}
                ref={emailRef}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearFieldError("email");
                }}
                required
              />
              {fieldErrors.email ? (
                <p id="email-error" className="text-sm text-red-600">
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                className="block text-sm font-bold text-slate-900"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className={inputClasses(Boolean(fieldErrors.password))}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter password"
                  value={password}
                  ref={passwordRef}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? "password-error" : undefined
                  }
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearFieldError("password");
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password ? (
                <p id="password-error" className="text-sm text-red-600">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                className="block text-sm font-bold text-slate-900"
                htmlFor="confirmPassword"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  className={inputClasses(Boolean(fieldErrors.confirmPassword))}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  ref={confirmPasswordRef}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={
                    fieldErrors.confirmPassword
                      ? "confirmPassword-error"
                      : undefined
                  }
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    clearFieldError("confirmPassword");
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword ? (
                <p id="confirmPassword-error" className="text-sm text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#C2410C] to-[#EA580C] py-3.5 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:scale-[1.02]"
            >
              Create account
            </button>

            <p className="text-xs text-center text-slate-500 mt-2">
              Takes less than 2 minutes
            </p>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                className="font-bold text-[#E85D04] hover:underline"
                href="/login-talent"
              >
                Login
              </Link>
            </p>

            <p className="text-xs text-slate-400">
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
    </main>
  );
}
