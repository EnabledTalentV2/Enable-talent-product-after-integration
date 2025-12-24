"use client";

import { useRef, useState, type FormEvent, type RefObject } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { setPendingSignup } from "@/lib/localUserStore";
import { Eye, EyeOff } from "lucide-react";

const inputClasses = (hasError?: boolean) =>
  `w-full rounded-lg border px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-gray-200 focus:border-amber-500 focus:ring-amber-500/50"
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
    <main className="min-h-screen bg-[#FCD34D]">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        {/* Decorative Background */}
        <div
          aria-hidden="true"
          className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full border-[40px] border-white/20 blur-sm"
        />
        <div
          aria-hidden="true"
          className="absolute top-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full border-[30px] border-white/10 blur-sm"
        />

        <article className="relative flex min-h-[550px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl shadow-2xl md:flex-row">
          <aside className="relative flex w-full flex-col justify-center bg-white/20 p-8 backdrop-blur-md md:w-5/12 md:p-12">
            <div className="relative z-10 space-y-3">
              <h2 className="text-3xl font-semibold text-gray-900">
                Seeking for a job?
              </h2>
              <p className="text-base font-medium leading-relaxed text-gray-800">
                Get your dream job by signing up to EnabledTalent.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent"
            />
          </aside>

          <div className="flex w-full justify-center bg-white p-8 md:w-7/12 md:p-12">
            <div className="w-full max-w-md">
              <h1 className="text-2xl font-bold text-gray-900">Sign Up</h1>
              <p className="mb-8 text-base text-gray-500">
                Create an account to start using EnabledTalent.
              </p>

              <form className="space-y-5" noValidate onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label
                    className="block text-base font-semibold text-gray-700"
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
                    className="block text-base font-semibold text-gray-700"
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
                    placeholder="Enter email address"
                    value={email}
                    ref={emailRef}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={
                      fieldErrors.email ? "email-error" : undefined
                    }
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
                    className="block text-base font-semibold text-gray-700"
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
                      placeholder="Create a password"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                    className="block text-base font-semibold text-gray-700"
                    htmlFor="confirmPassword"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      className={inputClasses(
                        Boolean(fieldErrors.confirmPassword)
                      )}
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
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
                  className="mt-4 w-full rounded-xl bg-[#B45309] py-3.5 font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#92400e]"
                >
                  Create account
                </button>
              </form>

              <p className="mt-6 text-center text-base text-gray-600">
                Already have an account?{" "}
                <Link
                  className="font-semibold text-[#B45309] hover:underline"
                  href="/login"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
