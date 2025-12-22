"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { setPendingSignup } from "@/lib/localUserStore";

const inputClasses =
  "w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50";

export default function SignUpPage() {
  const router = useRouter();
  const setUserData = useUserDataStore((s) => s.setUserData);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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
    router.push("/signup/manual-resume-fill");
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
              <h2 className="text-3xl font-semibold text-gray-900">Seeking for a job?</h2>
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
              <p className="mb-8 text-base text-gray-500">Create an account to start using EnabledTalent.</p>

              <form className="space-y-5" noValidate onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="block text-base font-semibold text-gray-700" htmlFor="fullname">
                    Full name
                  </label>
                  <input
                    className={inputClasses}
                    id="fullname"
                    name="fullname"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-base font-semibold text-gray-700" htmlFor="email">
                    Email
                  </label>
                  <input
                    className={inputClasses}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-base font-semibold text-gray-700" htmlFor="password">
                    Password
                  </label>
                  <input
                    className={inputClasses}
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-base font-semibold text-gray-700" htmlFor="confirmPassword">
                    Confirm password
                  </label>
                  <input
                    className={inputClasses}
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>

                {error ? <p className="text-base font-medium text-red-600">{error}</p> : null}

                <button
                  type="submit"
                  className="mt-4 w-full rounded-xl bg-[#B45309] py-3.5 font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#92400e]"
                >
                  Create account
                </button>
              </form>

              <p className="mt-6 text-center text-base text-gray-600">
                Already have an account?{" "}
                <Link className="font-semibold text-[#B45309] hover:underline" href="/login">
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

