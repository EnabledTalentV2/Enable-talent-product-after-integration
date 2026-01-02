"use client";

import Image from "next/image";
import Link from "next/link";
import backgroundVectorSvg from "@/public/Vector 4500.svg";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import logo from "@/public/logo/ET Logo-01.webp";

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
  const [error, setError] = useState(""); // General error message for API failures

  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const employerNameRef = useRef<HTMLInputElement | null>(null);
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
    { key: "employerName", label: "Employer name", ref: employerNameRef },
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setError(""); // Clear any previous errors

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

    // Send signup request to backend
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          confirm_password: password, // Django requires password confirmation
          fullName: trimmedName,
          employerName: trimmedEmployerName,
          role: "employer",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle Django validation errors
        if (typeof errorData === "object") {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(", ")}`;
            })
            .join("\n");
          setError(errorMessages || "Signup failed. Please try again.");
        } else {
          setError(errorData.message || "Signup failed. Please try again.");
        }
        return;
      }

      const sessionResponse = await fetch("/api/user/me", {
        credentials: "include",
      });

      if (!sessionResponse.ok) {
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: trimmedEmail,
            password,
          }),
        });

        if (!loginResponse.ok) {
          const loginError = await loginResponse.json().catch(() => ({}));
          const message =
            loginError.detail ||
            loginError.error ||
            loginError.message ||
            "Account created, but we couldn't sign you in. Please log in.";
          setError(message);
          return;
        }
      }

      router.push("/signup-employer/organisation-info");
    } catch (err) {
      console.error("Signup error:", err);
      setError("Network error. Please try again.");
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
              <h2
                id="employer-signup-heading"
                className="text-[26px] font-semibold text-gray-900 mb-2"
              >
                Sign Up
              </h2>
              <p className="text-sm text-gray-500">
                Create an employer account to start hiring
              </p>
            </div>

            <form
              className="space-y-4"
              aria-labelledby="employer-signup-heading"
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
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <p className="font-semibold">Error</p>
                  <p className="mt-1 whitespace-pre-wrap">{error}</p>
                </div>
              )}
              <div className="space-y-1">
                <label
                  className="block text-[16px] font-semibold text-gray-900"
                  htmlFor="employer-fullname"
                >
                  Full name
                  <span aria-hidden="true" className="text-gray-500">
                    {" "}
                    *
                  </span>
                  <span className="sr-only">required</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className={inputClasses(Boolean(fieldErrors.fullName))}
                  id="employer-fullname"
                  name="fullName"
                  autoComplete="name"
                  value={fullName}
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={
                    fieldErrors.fullName ? "employer-fullname-error" : undefined
                  }
                  aria-required="true"
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}
                  ref={fullNameRef}
                />
                {fieldErrors.fullName && (
                  <p
                    id="employer-fullname-error"
                    className="mt-1 text-sm text-red-600"
                  >
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  className="block text-[16px] font-semibold text-gray-900"
                  htmlFor="employer-name"
                >
                  Employer name
                  <span aria-hidden="true" className="text-gray-500">
                    {" "}
                    *
                  </span>
                  <span className="sr-only">required</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter employer name"
                  className={inputClasses(Boolean(fieldErrors.employerName))}
                  id="employer-name"
                  name="employerName"
                  autoComplete="organization"
                  value={employerName}
                  aria-invalid={Boolean(fieldErrors.employerName)}
                  aria-describedby={
                    fieldErrors.employerName ? "employer-name-error" : undefined
                  }
                  aria-required="true"
                  onChange={(e) => {
                    setEmployerName(e.target.value);
                    clearFieldError("employerName");
                  }}
                  ref={employerNameRef}
                />
                {fieldErrors.employerName && (
                  <p
                    id="employer-name-error"
                    className="mt-1 text-sm text-red-600"
                  >
                    {fieldErrors.employerName}
                  </p>
                )}
              </div>

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
                  className={inputClasses(Boolean(fieldErrors.email))}
                  id="employer-email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "employer-email-error" : undefined
                  }
                  aria-required="true"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  ref={emailRef}
                />
                {fieldErrors.email && (
                  <p
                    id="employer-email-error"
                    className="mt-1 text-sm text-red-600"
                  >
                    {fieldErrors.email}
                  </p>
                )}
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
                    className={`${inputClasses(
                      Boolean(fieldErrors.password)
                    )} pr-14`}
                    id="employer-password"
                    name="password"
                    autoComplete="new-password"
                    value={password}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password
                        ? "employer-password-error"
                        : undefined
                    }
                    aria-required="true"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError("password");
                    }}
                    ref={passwordRef}
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
                {fieldErrors.password && (
                  <p
                    id="employer-password-error"
                    className="mt-1 text-sm text-red-600"
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  className="block text-[16px] font-semibold text-gray-900"
                  htmlFor="employer-confirm-password"
                >
                  Confirm Password
                  <span aria-hidden="true" className="text-gray-500">
                    {" "}
                    *
                  </span>
                  <span className="sr-only">required</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className={`${inputClasses(
                      Boolean(fieldErrors.confirmPassword)
                    )} pr-14`}
                    id="employer-confirm-password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    aria-describedby={
                      fieldErrors.confirmPassword
                        ? "employer-confirm-password-error"
                        : undefined
                    }
                    aria-required="true"
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearFieldError("confirmPassword");
                    }}
                    ref={confirmPasswordRef}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showConfirmPassword}
                    aria-controls="employer-confirm-password"
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p
                    id="employer-confirm-password-error"
                    className="mt-1 text-sm text-red-600"
                  >
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 focus-visible:ring-offset-white"
              >
                Create account
              </button>

              <p className="mt-2 text-center text-[11px] text-gray-500">
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

            <div className="mt-6 text-center text-[11px] text-gray-500">
              By clicking login, you agree to our{" "}
              <Link
                href="/terms"
                className="underline text-gray-600 hover:text-gray-700"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline text-gray-600 hover:text-gray-700"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
