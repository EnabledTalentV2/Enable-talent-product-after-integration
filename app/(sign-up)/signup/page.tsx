"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { setPendingSignup } from "@/lib/localUserStore";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/public/logo/ET Logo-01.webp";
import backgroundVectorSvg from "@/public/Vector 4500.svg";

const inputClasses = (hasError?: boolean) =>
  `w-full h-11 rounded-lg border bg-white px-4 text-sm text-slate-900 transition-shadow placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-slate-200 focus:border-[#E58C3A] focus:ring-[#F6C071]/60"
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
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const hasErrors = Object.keys(fieldErrors).length > 0;
  const fieldMeta: Array<{
    key: keyof FieldErrors;
    label: string;
    ref: RefObject<HTMLInputElement | null>;
  }> = [
    { key: "fullName", label: "Full name", ref: fullNameRef },
    { key: "email", label: "Email", ref: emailRef },
    { key: "password", label: "Password", ref: passwordRef },
    {
      key: "confirmPassword",
      label: "Confirm password",
      ref: confirmPasswordRef,
    },
  ];

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
    <main className="min-h-screen w-full bg-gradient-to-br from-[#F7D877] via-[#F2BF4A] to-[#E8A426] relative overflow-hidden flex items-center justify-center">
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
        <div className="pointer-events-none absolute inset-0 rounded-[36px] border border-white/35 bg-gradient-to-br from-[#F7D877]/90 via-[#F2BF4A]/90 to-[#E8A426]/90 backdrop-blur-sm shadow-[0_20px_50px_rgba(120,72,12,0.18)]" />
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
                id="talent-signup-heading"
                className="text-[26px] font-semibold text-slate-900 mb-2"
              >
                Sign Up
              </h2>
              <p className="text-sm text-slate-500">
                Create a Talent account to start applying
              </p>
            </div>

            <form
              className="space-y-4"
              aria-labelledby="talent-signup-heading"
              noValidate
              onSubmit={handleSubmit}
            >
              {hasErrors ? (
                <div
                  ref={errorSummaryRef}
                  role="alert"
                  tabIndex={-1}
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <p className="font-semibold">Please fix the following:</p>
                  <ul className="mt-2 space-y-1">
                    {fieldMeta.map(({ key, label, ref }) => {
                      const message = fieldErrors[key];
                      if (!message) return null;
                      return (
                        <li key={key}>
                          <button
                            type="button"
                            onClick={() => ref.current?.focus()}
                            className="text-left underline"
                          >
                            {label}: {message}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
              <div className="space-y-1">
                <label
                  className="block text-[16px] font-semibold text-slate-700"
                  htmlFor="fullname"
                >
                  Full name
                  <span aria-hidden="true" className="text-slate-400">
                    {" "}
                    *
                  </span>
                  <span className="sr-only">required</span>
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
                  aria-required="true"
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
                  className={inputClasses(Boolean(fieldErrors.email))}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter email"
                  value={email}
                  ref={emailRef}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "email-error" : undefined
                  }
                  aria-required="true"
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
                    className={`${inputClasses(Boolean(fieldErrors.password))} pr-14`}
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
                    aria-required="true"
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearFieldError("password");
                    }}
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E58C3A]"
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

              <div className="space-y-1">
                <label
                  className="block text-[16px] font-semibold text-slate-700"
                  htmlFor="confirmPassword"
                >
                  Confirm password
                  <span aria-hidden="true" className="text-slate-400">
                    {" "}
                    *
                  </span>
                  <span className="sr-only">required</span>
                </label>
                <div className="relative">
                  <input
                    className={`${inputClasses(
                      Boolean(fieldErrors.confirmPassword)
                    )} pr-14`}
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
                    aria-required="true"
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      clearFieldError("confirmPassword");
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showConfirmPassword}
                    aria-controls="confirmPassword"
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E58C3A]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword ? (
                  <p
                    id="confirmPassword-error"
                    className="text-sm text-red-600"
                  >
                    {fieldErrors.confirmPassword}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#B45309] to-[#E57E25] py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(182,97,35,0.35)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E58C3A] focus-visible:ring-offset-white"
              >
                Create account
              </button>

              <p className="text-[11px] text-center text-slate-500 mt-2">
                Takes less than 2 minutes
              </p>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-[13px] text-slate-600">
                Already have an account?{" "}
                <Link
                  className="font-semibold text-[#B45309] hover:underline"
                  href="/login-talent"
                >
                  Login
                </Link>
              </p>

              <p className="text-[11px] text-slate-500">
                By clicking login, you agree to our{" "}
                <Link href="/terms" className="underline text-slate-600 hover:text-slate-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline text-slate-600 hover:text-slate-700">
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
