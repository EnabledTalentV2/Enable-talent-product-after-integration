"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, LogOut, User } from "lucide-react";
import { useUserDataStore } from "@/lib/userDataStore";
import { clearCurrentUser } from "@/lib/localUserStore";
import Link from "next/link";
import { useEmployerJobsStore } from "@/lib/employerJobsStore";

export default function DashBoardNavbarEmployer() {
  const router = useRouter();
  const resetUserData = useUserDataStore((s) => s.resetUserData);
  const resetJobs = useEmployerJobsStore((s) => s.resetJobs);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      clearCurrentUser();
      resetUserData();
      resetJobs();
      router.push("/login-employer");
    }
  };

  return (
    <nav className="flex h-20 items-center justify-center bg-[#EEF5FF] px-6 md:px-12">
      <div className="flex w-full max-w-8xl items-center justify-between">
        <a
          href="https://enable-talent-landing.vercel.app/"
          className="flex items-center gap-3"
        >
          <Image
            src="/logo/et-new.svg"
            alt="EnabledTalent logo"
            width={150}
            height={40}
            priority
            className="h-10 w-auto object-contain"
          />
        </a>

        <div className="flex items-center gap-7">
          <Link
            href="/employer/dashboard/company-profile"
            className="hidden items-center gap-2 text-base font-medium text-slate-600 transition-colors hover:text-slate-900 md:flex"
          >
            <User size={18} />
            <span>Profile</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden items-center gap-2 text-base font-medium text-slate-600 transition-colors hover:text-slate-900 md:flex"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
          <button
            className="relative text-slate-600 transition-colors hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute -right-1 -top-1 block h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
          </button>
          <Link
            href="/employer/dashboard/post-jobs"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C05621] to-[#FBBF24] px-5 py-2.5 text-base font-semibold text-white shadow-md transition-opacity hover:opacity-90"
          >
            
            <span>Post a Job</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
