"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import backgroundVectorSvg from "@/public/Vector 4500.svg";
import logo from "@/public/logo/ET Logo-01.webp";
import { ArrowLeft } from "lucide-react";

type LoginPageLayoutProps = {
  children: ReactNode;
};

export default function LoginPageLayout({ children }: LoginPageLayoutProps) {
  return (
    <main
      id="main-content"
      className="min-h-screen w-full bg-gradient-to-br from-[#F7D877] via-[#F2BF4A] to-[#E8A426] relative overflow-hidden flex flex-col items-center md:justify-center"
    >
      <div className="w-full p-6 z-30 flex justify-start md:absolute md:top-0 md:left-0">
        <a
          href="https://www.enabledtalent.com/"
          className="group flex items-center gap-2 text-sm font-medium text-slate-900 transition-colors hover:text-[#8C4A0A] bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C4A0A] focus-visible:ring-offset-2"
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
      <div className="relative z-10 mx-auto w-full max-w-5xl px-0 ">
        <div className=" pointer-events-none absolute inset-0 rounded-[36px] border border-white/35 bg-gradient-to-br from-[#F7D877]/90 via-[#F2BF4A]/90 to-[#E8A426]/90 backdrop-blur-sm shadow-[0_20px_50px_rgba(120,72,12,0.18)]" />
        <div className="relative flex w-full flex-col items-center justify-center gap-12 px-0 py-4 md:flex-row md:gap-20">
          {/* Left Side Content */}
          <div className="flex max-w-105 flex-col items-center text-center ">
            <div className="relative mb-8 flex items-center justify-center">
              <div className="pointer-events-none absolute -inset-8 rounded-full bg-[#8C4A0A] opacity-70 blur-3xl mix-blend-multiply" />
              <div className="pointer-events-none absolute -inset-3 rounded-full bg-[#B45309] opacity-90 blur-2xl mix-blend-multiply" />
              <a
                href="https://www.enabledtalent.com/"
                className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/70 bg-white/85 shadow-[0_12px_24px_rgba(146,86,16,0.2)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C4A0A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2BF4A]"
                aria-label="Enabled Talent Logo - Back to Homepage"
              >
                <Image
                  src={logo}
                  alt=""
                  className="h-12 w-12 object-contain"
                  aria-hidden="true"
                />
              </a>
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
            {children}
          </div>
        </div>
      </div>
      <div className="mt-8 relative z-20 rounded-[24px] border border-white/50 bg-gradient-to-br from-[#fff8e1]/95 via-[#ffecb3]/95 to-[#ffe082]/95 backdrop-blur-sm shadow-[0_10px_25px_rgba(120,72,12,0.10)]">
        <p className="px-8 py-3 text-[14px] font-medium text-slate-900 text-center">
          Are you an Employer?{" "}
          <Link
            className="font-bold text-[#8C4A0A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C4A0A] focus-visible:ring-offset-2 focus-visible:ring-offset-amber-300 rounded-sm"
            href="/login-employer"
            aria-label="Log in here to the Employer portal"
          >
            Log in here!
          </Link>
        </p>
      </div>
    </main>
  );
}
