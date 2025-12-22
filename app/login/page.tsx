"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { clearCurrentUser, getUserByEmail, setCurrentUser } from "@/lib/localUserStore";

const inputClasses =
  "w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50";

export default function LoginPage() {
  const router = useRouter();
  const setUserData = useUserDataStore((s) => s.setUserData);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <main className="min-h-screen bg-[#FCD34D]">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <div
          aria-hidden="true"
          className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full border-[40px] border-white/20 blur-sm"
        />
        <div
          aria-hidden="true"
          className="absolute top-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full border-[30px] border-white/10 blur-sm"
        />

        <article className="relative flex min-h-[520px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl shadow-2xl md:flex-row">
          <aside className="relative flex w-full flex-col justify-center bg-white/20 p-8 backdrop-blur-md md:w-5/12 md:p-12">
            <div className="relative z-10 space-y-3">
              <h2 className="text-3xl font-semibold text-gray-900">Welcome back</h2>
              <p className="text-base font-medium leading-relaxed text-gray-800">
                Log in to continue your EnabledTalent journey.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent"
            />
          </aside>

          <div className="flex w-full justify-center bg-white p-8 md:w-7/12 md:p-12">
            <div className="w-full max-w-md">
              <h1 className="text-2xl font-bold text-gray-900">Login</h1>
              <p className="mb-8 text-base text-gray-500">Sign in with your email and password.</p>

              <form className="space-y-5" noValidate onSubmit={handleSubmit}>
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
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                {error ? <p className="text-base font-medium text-red-600">{error}</p> : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 w-full rounded-xl bg-[#B45309] py-3.5 font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#92400e] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Signing in..." : "Login"}
                </button>
              </form>

              <p className="mt-6 text-center text-base text-gray-600">
                New here?{" "}
                <Link className="font-semibold text-[#B45309] hover:underline" href="/signup">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

