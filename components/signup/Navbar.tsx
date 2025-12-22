import Image from "next/image";
import Link from "next/link";
import { Bell, LogOut, Search, User } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex h-20 items-center justify-center px-6 md:px-12 bg-white shadow-sm">
        <div className="flex w-full max-w-6xl items-center justify-between">
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
            <Link href="/dashboard" className="hidden items-center gap-2 text-base font-medium text-slate-500 transition-colors hover:text-slate-800 md:flex">
              <User size={18} />
              <span>Profile</span>
            </Link >
            <button className="hidden items-center gap-2 text-base font-medium text-slate-500 transition-colors hover:text-slate-800 md:flex">
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
            <button className="relative text-slate-500 transition-colors hover:text-slate-800" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute -right-1 -top-1 block h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
            </button>
            <button className="flex items-center gap-2 rounded-full bg-linear-to-r from-orange-600 to-amber-400 px-5 py-2.5 text-base font-semibold text-white shadow-md transition-opacity hover:opacity-90">
              <Search size={18} strokeWidth={3} />
              <span>AI Career Coach</span>
            </button>
          </div>
        </div>
      </nav>
  );
}
        

