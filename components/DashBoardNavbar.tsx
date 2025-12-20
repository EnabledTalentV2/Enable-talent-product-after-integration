"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Search, User } from "lucide-react";
import { useUserDataStore } from "@/lib/userDataStore";
import { clearCurrentUser } from "@/lib/localUserStore";

export default function DashBoardNavbar() {
  const router = useRouter();
  const resetUserData = useUserDataStore((s) => s.resetUserData);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      clearCurrentUser();
      resetUserData();
      router.push("/login");
    }
  };

  return (
    <nav className="flex h-20 items-center justify-center bg-[#F0F4F8] px-6 md:px-12">
      <div className="flex w-full max-w-8xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo/et-new.svg"
            alt="EnabledTalent logo"
            width={150}
            height={40}
            priority
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-7">
          <button className="hidden items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 md:flex">
            <User size={18} />
            <span>Profile</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="hidden items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 md:flex"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
          <button className="relative text-slate-600 transition-colors hover:text-slate-900">
            <Bell size={20} />
            <span className="absolute -right-1 -top-1 block h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
          </button>
          <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C05621] to-[#FBBF24] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90">
            <Search size={18} strokeWidth={3} />
            <span>AI Career Coach</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
        
