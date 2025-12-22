"use client";

import { useUserDataStore } from "@/lib/userDataStore";

type Props = {
  percent: number;
};

export default function Header({ percent }: Props) {
  const userData = useUserDataStore((s) => s.userData);
  const { firstName, lastName } = userData.basicInfo;
  const fullName = `${firstName} ${lastName}`.trim() || "User";

  const safePercent = Math.min(100, Math.max(0, Math.round(percent)));
  const ringColor = safePercent >= 100 ? "text-emerald-500" : "text-orange-500";
  const numberColor =
    safePercent >= 100 ? "text-emerald-600" : "text-[#C05621]";

  return (
    <header className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#C05621] to-[#FBBF24] shadow-lg px-6 py-8 md:px-12 md:py-10">
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="text-white">
          <p className="text-lg md:text-xl font-light opacity-90">Welcome</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1">{fullName}</h1>
        </div>

        <div className="relative flex items-center justify-center bg-white/90 backdrop-blur rounded-full w-36 h-36 shadow-md border-4 border-white/20">
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
              strokeDasharray={`${safePercent}, 100`}
              strokeLinecap="round"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
            <span className={`text-3xl font-bold ${numberColor}`}>
              {safePercent}%
            </span>
            <span className="text-sm uppercase font-bold tracking-wider text-slate-500">
              Profile
            </span>
            <span className="text-sm uppercase font-bold tracking-wider text-slate-500">
              Completed
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
