"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  Search,
  User,
} from "lucide-react";

export default function DashboardSubNavEmployer() {
  const pathname = usePathname();
  const linkClass =
    "flex items-center gap-2 rounded-full px-3 py-2 text-base font-medium transition-colors";
  const inactiveClass =
    "text-slate-600 hover:bg-slate-200 hover:text-slate-900";
  const activeClass = "bg-[#DCE6F1] text-slate-900 shadow-sm";
  const disabledClass = "text-slate-400";
  const navItems = [
    {
      href: "/employer/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: (path: string) => path === "/employer/dashboard",
    },
    {
      href: "/employer/dashboard/candidates",
      label: "Candidates",
      icon: User,
      isActive: (path: string) => path.startsWith("/employer/dashboard/candidates"),
    },
    {
      href: "/employer/dashboard/listed-jobs",
      label: "Listed Jobs",
      icon: BriefcaseBusiness,
      isActive: (path: string) =>
        path.startsWith("/employer/dashboard/listed-jobs"),
    },
    {
      href: "/employer/dashboard/company-profile",
      label: "Company Profile",
      icon: Building2,
      isActive: (path: string) => path.startsWith("/employer/dashboard/company-profile"),
    },
  ];

  return (
    <div className="flex justify-center bg-[#EEF5FF] px-6 pb-6 md:px-12">
      <div className="flex w-full max-w-8xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Desktop Navigation Links - Hidden on Mobile */}
        <div className="hidden md:flex flex-wrap items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive(pathname);
            const stateClass = isActive ? activeClass : inactiveClass;
            const baseClass = linkClass;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`${baseClass} ${stateClass}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Search Bar - Visible on All Screen Sizes */}
        <div className="w-full md:w-[420px]">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by skills, company or job"
              aria-label="Search by skills, company or job"
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pr-12 text-base text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <Search aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
