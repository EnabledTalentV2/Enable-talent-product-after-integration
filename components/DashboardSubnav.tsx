'use client';

import { BriefcaseBusiness, Building2, Home, Search, User } from "lucide-react";

export default function DashboardSubnav() {
  const linkClass = "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors";

  return (
    <div className="flex justify-center bg-[#EEF3FF] px-6 pb-6 md:px-12">
      <div className="flex w-full max-w-8xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button className={`${linkClass} text-slate-700 hover:bg-slate-300 hover:text-black`}>
            <Home size={16} />
            <span>Home</span>
          </button>
          <button className={`${linkClass} text-slate-700 hover:bg-slate-300 hover:text-black`}>
            <BriefcaseBusiness size={16} />
            <span>My Jobs</span>
          </button>
          <button className={`${linkClass} text-slate-700 hover:bg-slate-300 hover:text-black`}>
            <Building2 size={16} />
            <span>Companies</span>
          </button>
          <button className={`${linkClass} text-slate-700 hover:bg-slate-300 hover:text-black`}>
            <User size={16} />
            <span>Profile</span>
          </button>
        </div>

        <div className="w-full md:w-[420px]">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by skills, company or job"
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pr-12 text-sm text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
