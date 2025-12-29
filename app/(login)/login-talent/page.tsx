"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
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
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-[#E85D04] focus:outline-none focus:ring-1 focus:ring-[#E85D04]";

export default function LoginPage() {
  const router = useRouter();
  const setUserData = useUserDataStore((s) => s.setUserData);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Login</h2>
            <p className="text-slate-500">Log in to your Talent account</p>
          </div>

          <form className="space-y-5" noValidate onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label
                className="block text-sm font-bold text-slate-900"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className={inputClasses}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
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
                  className={inputClasses}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
            </div>

            {error ? (
              <p className="text-sm font-medium text-red-600 text-center">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#C2410C] to-[#EA580C] py-3.5 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                className="font-bold text-[#E85D04] hover:underline"
                href="/signup"
              >
                Sign up
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
