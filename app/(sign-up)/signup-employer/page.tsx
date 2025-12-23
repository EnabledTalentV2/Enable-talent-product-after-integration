"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, type FormEvent, type RefObject } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import logo from "@/public/logo/ET Logo-01.webp";
import { setPendingSignup } from "@/lib/localUserStore";

const inputClasses = (hasError?: boolean) =>
  `w-full px-4 py-3 rounded-lg border outline-none transition-colors text-gray-700 placeholder-gray-400 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
      : "border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
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
    setPendingSignup({ email: trimmedEmail, password });

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
    <div className="min-h-screen w-full bg-[#C5D8F5] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-6xl bg-white/30 backdrop-blur-md rounded-[30px] shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        {/* Left Side - Welcome */}
        <div className="w-full md:w-1/2 p-12 flex flex-col items-center justify-center text-center relative">
          <div className="mb-8 relative">
            {/* Orange glow effect behind logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-400/50 rounded-full blur-2xl"></div>
            <div className="relative w-24 h-24 flex items-center justify-center bg-white rounded-full shadow-sm p-4">
              <Image
                src={logo}
                alt="Enabled Talent Logo"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome To Enabled Talent
          </h1>
          <p className="text-gray-700 text-lg max-w-md">
            Find and hire top talent across Canada - faster and smarter
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center rounded-[30px] md:rounded-l-none md:rounded-r-[30px]">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign Up</h2>
              <p className="text-gray-500">
                Create an employer account to start hiring
              </p>
            </div>

            <form className="space-y-5" noValidate onSubmit={handleSubmit}>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">
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
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">
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
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.employerName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">
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
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">
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
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">
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
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#C04622] to-[#E88F53] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity shadow-md mt-6"
              >
                Create account
              </button>

              <p className="text-center text-gray-400 text-sm mt-2">
                Takes less than 2 minutes
              </p>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login-employer"
                  className="text-[#C04622] font-semibold hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
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
    </div>
  );
}
