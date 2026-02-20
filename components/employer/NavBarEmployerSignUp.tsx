import Image from "next/image";
import Link from "next/link";
import { Bell, LogOut, User, Search } from "lucide-react";
import logo from "@/public/logo/ET Logo-01.webp";

export default function Navbar() {
  return (
    <nav className="flex h-20 items-center justify-center px-6 md:px-12 bg-transparent">
      <div className="flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="Enabled Talent Logo"
            width={150}
            height={40}
            priority
            className="h-10 w-auto object-contain"
          />
          <span className="text-xl font-semibold text-gray-700">
            Enabled Talent
          </span>
        </div>

        <div className="flex items-center gap-7">
          <Link
            href="/profile"
            className="hidden items-center gap-2 text-base font-medium text-slate-700 transition-colors hover:text-slate-800 md:flex"
          >
            <User size={18} />
            <span>Profile</span>
          </Link>
          <button className="hidden items-center gap-2 text-base font-medium text-slate-700 transition-colors hover:text-slate-800 md:flex">
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
          <button
            className="relative text-slate-700 transition-colors hover:text-slate-800"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute -right-0.5 -top-0.5 block h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-[#C5D8F5]" />
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-orange-900 px-6 py-2.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-orange-950">
            <Search size={18} strokeWidth={2.5} />
            <span>Post a Job</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
