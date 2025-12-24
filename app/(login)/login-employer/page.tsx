"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import logo from "@/public/logo/ET Logo-01.webp";
import { useEmployerDataStore } from "@/lib/employerDataStore";
import {
  getEmployerByEmail,
  setCurrentEmployer,
} from "@/lib/localEmployerStore";

export default function EmployerLoginPage() {
  const router = useRouter();
  const setEmployerData = useEmployerDataStore((s) => s.setEmployerData);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const storedEmployer = getEmployerByEmail(trimmedEmail);
    if (!storedEmployer || storedEmployer.password !== password) {
      setError("Invalid email or password.");
      return;
    }

    setCurrentEmployer(trimmedEmail);
    setEmployerData(() => storedEmployer.employerData);
    router.push("/employer/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-[#C5D8F5] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-6xl bg-white/30 backdrop-blur-md rounded-[30px] shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side - Welcome */}
        <div className="w-full md:w-1/2 p-12 flex flex-col items-center justify-center text-center relative">
          <div className="mb-8 relative">
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
            Welcome Back
          </h1>
          <p className="text-gray-700 text-lg max-w-md">
            Log in to manage your job postings and find top talent.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center rounded-[30px] md:rounded-l-none md:rounded-r-[30px]">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Employer Login
              </h2>
              <p className="text-gray-500">
                Enter your credentials to access your account
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-700 placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-700 placeholder-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-600">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  title="Forgot Password"
                  className="text-[#C04622] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#C04622] to-[#E88F53] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity shadow-md mt-6"
              >
                Login
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup-employer"
                  className="text-[#C04622] font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
