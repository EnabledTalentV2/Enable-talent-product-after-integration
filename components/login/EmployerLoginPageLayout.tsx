"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import backgroundVectorSvg from "@/public/Vector 4500.svg";
import logo from "@/public/logo/ET Logo-01.webp";
import { ArrowLeft } from "lucide-react";

type EmployerLoginPageLayoutProps = {
  children: ReactNode;
};

export default function EmployerLoginPageLayout({ children }: EmployerLoginPageLayoutProps) {
  return (
    <main
      id="main-content"
      className="min-h-screen w-full bg-[#C5D8F5] relative overflow-hidden flex flex-col items-center md:justify-center"
    >
      <div className="w-full p-6 z-30 flex justify-start md:absolute md:top-0 md:left-0">
        <a
          href="https://www.enabledtalent.com/"
          className="group flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-[#C04622] bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C04622] focus-visible:ring-offset-2"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
          Back to Homepage
          <span className="sr-only">(opens external site)</span>
        </a>
      </div>
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
              <div className="pointer-events-none absolute -inset-8 rounded-full bg-orange-400/50 blur-3xl" />
              <div className="pointer-events-none absolute -inset-3 rounded-full bg-orange-400/70 blur-2xl" />
              <a
                href="https://www.enabledtalent.com/"
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm p-4 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C04622] focus-visible:ring-offset-2 focus-visible:ring-offset-[#C5D8F5]"
                aria-label="Enabled Talent Logo - Back to Homepage"
              >
                <Image
                  src={logo}
                  alt=""
                  width={60}
                  height={60}
                  className="h-12 w-12 object-contain"
                  aria-hidden="true"
                />
              </a>
            </div>

            <h1 className="text-3xl font-semibold text-gray-900 mb-4 leading-tight md:text-4xl">
              Welcome Back
            </h1>
            <p className="text-base text-gray-700 md:text-lg max-w-md">
              Log in to manage your job postings and find top talent.
            </p>
          </div>

          {/* Right Side - Form */}
          <div className="w-full max-w-[460px] rounded-[32px] bg-white px-8 py-10 shadow-xl md:px-10 md:py-12">
            {children}
          </div>
        </div>
      </div>

      <div className="mt-8 relative z-20 rounded-[24px] border border-white/50 bg-gradient-to-br from-[#eef6ff]/95 via-[#f5faff]/95 to-[#ffffff]/95 backdrop-blur-sm shadow-[0_10px_25px_rgba(30,58,138,0.10)]">
        <p className="px-8 py-3 text-[14px] font-medium text-slate-900 text-center">
          Are you a Candidate?{" "}
          <Link
            className="font-bold text-[#C04622] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C04622] focus-visible:ring-offset-2 focus-visible:ring-offset-blue-100 rounded-sm"
            href="/login-talent"
            aria-label="Log in here to the Candidate portal"
          >
            Log in here!
          </Link>
        </p>
      </div>
    </main>
  );
}
