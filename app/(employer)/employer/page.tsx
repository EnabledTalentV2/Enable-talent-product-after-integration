import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function Employers() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center bg-[#F0F4F8] p-6">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="flex justify-center">
          <Image
            src="/logo/et-new.svg"
            alt="EnabledTalent logo"
            width={180}
            height={48}
            priority
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-sm md:p-12">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Employer Portal
            </h1>
            <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-[#C05621] to-[#FBBF24]" />
            <p className="text-lg text-slate-700">
              We are currently building a world-class experience for our
              employer partners.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-900">
              <svg
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <p className="font-medium text-slate-700">Work in Progress</p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>
          </div>
        </div>

        <p className="text-base text-slate-400">
          &copy; 2025 Enabled Talent. All rights reserved.
        </p>
      </div>
    </main>
  );
}

