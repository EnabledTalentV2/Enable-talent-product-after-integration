"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, FormEvent } from "react";
import {
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  Search,
  User,
} from "lucide-react";

export default function DashboardSubNavEmployer() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const handleSearch = useCallback((e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      router.push(`/employer/dashboard/candidates?search=${encodeURIComponent(trimmedQuery)}`);
    } else {
      // If empty search, just go to candidates page without search param
      router.push("/employer/dashboard/candidates");
    }
  }, [searchQuery, router]);
  const linkClass =
    "flex items-center gap-2 rounded-full px-3 py-2 text-base font-medium transition-colors";
  const inactiveClass =
    "text-slate-700 hover:bg-slate-200 hover:text-slate-900";
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
                <Icon size={16} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Search Bar - Visible on All Screen Sizes */}
        <form onSubmit={handleSearch} className="w-full md:w-[420px]" role="search" aria-label="Search candidates">
          <div className="relative w-full">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidates by name..."
              aria-label="Search candidates"
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pr-12 text-base text-slate-800 shadow-sm focus:border-[#C27803] focus:outline-none focus:ring-2 focus:ring-[#C27803]/20"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
