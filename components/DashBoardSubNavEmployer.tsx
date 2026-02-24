"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, FormEvent, useEffect } from "react";
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
  const searchFromUrl = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);

  useEffect(() => {
    setSearchQuery(searchFromUrl);
  }, [searchFromUrl]);

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
        <form onSubmit={handleSearch} className="w-full md:w-[520px]" role="search" aria-label="Search candidates">
          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
            <div className="relative flex-1">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by name..."
                aria-label="Search candidates"
                aria-describedby="employer-search-help"
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pr-12 text-base text-slate-800 shadow-sm focus:border-[#C27803] focus:outline-none focus:ring-2 focus:ring-[#C27803]/20"
              />
              <Search
                className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-orange-900 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-orange-950 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#C27803]"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Search</span>
            </button>
          </div>
          <p id="employer-search-help" className="mt-1 text-center text-xs text-slate-700">
            Press Enter or select Search.
          </p>
        </form>
      </div>
    </div>
  );
}
