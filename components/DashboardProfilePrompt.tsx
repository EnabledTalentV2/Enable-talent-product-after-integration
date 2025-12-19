"use client";

import Link from "next/link";

type DashboardProfilePromptProps = {
  percent: number;
};

export default function DashboardProfilePrompt({ percent }: DashboardProfilePromptProps) {
  if (percent >= 100) {
    return null;
  }
    const safePercent = Math.min(100, Math.max(0, Math.round(percent)));
  const ringColor = safePercent >= 100 ? "text-emerald-500" : "text-orange-500";
  const numberColor = safePercent >= 100 ? "text-emerald-600" : "text-[#C05621]";

  

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#C94A2A] via-[#D96C3B] to-[#F1B45C] p-6 text-white shadow-sm">
      <div className="absolute right-10 top-6 h-32 w-32 rounded-full border border-white/25 opacity-40" />
      <div className="absolute right-24 top-2 h-24 w-24 rounded-full border border-white/20 opacity-50" />
      <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Make your profile</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Standout from 1000s of candidates</h2>
          <Link
            href="/signup/manual-resume-fill"
            className="mt-4 inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#9A3412] shadow-sm transition hover:bg-white/90"
          >
            Update Profile
          </Link>
        </div>
        <div className="flex items-center gap-4">
          
           <div className="relative flex items-center justify-center bg-white/90 backdrop-blur rounded-full w-28 h-28 shadow-md border-4 border-white/20">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 36 36"
            role="img"
            aria-label={`Profile completed ${safePercent}%`}
          >
            <path
              className="text-gray-200"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className={ringColor}
              strokeDasharray={`${percent}, 100`}
              strokeLinecap="round"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
            <span className={`text-2xl font-bold ${numberColor}`}>{safePercent}%</span>
            <span className="text-[9px] uppercase font-semibold text-slate-500">Profile</span>
            <span className="text-[9px] uppercase font-semibold text-slate-500">Completed</span>
          </div>
        </div>
            
          
         
        </div>
      </div>
    </div>
  );
}
