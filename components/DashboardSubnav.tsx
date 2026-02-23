"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Home,
  LayoutDashboard,
  Search,
  User,
} from "lucide-react";

export default function DashboardSubnav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(searchQuery);
  const isOnSearchablePage = pathname.startsWith("/dashboard/my-jobs");

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const updateRouteWithQuery = useCallback(
    (
      value: string,
      options: { forceMyJobs?: boolean; method?: "push" | "replace" } = {},
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmedValue = value.trim();
      if (trimmedValue) {
        params.set("q", trimmedValue);
      } else {
        params.delete("q");
      }

      const targetPath =
        options.forceMyJobs || (!isOnSearchablePage && trimmedValue)
          ? "/dashboard/my-jobs"
          : pathname;
      const nextUrl = params.toString()
        ? `${targetPath}?${params.toString()}`
        : targetPath;
      const navigationMethod = options.method ?? "replace";

      if (navigationMethod === "push") {
        router.push(nextUrl);
      } else {
        router.replace(nextUrl);
      }
    },
    [searchParams, isOnSearchablePage, pathname, router],
  );

  useEffect(() => {
    if (!isOnSearchablePage) {
      return;
    }
    if (inputValue === searchQuery) {
      return;
    }

    const timer = setTimeout(() => {
      updateRouteWithQuery(inputValue, { method: "replace" });
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, searchQuery, isOnSearchablePage, updateRouteWithQuery]);

  const handleSearchSubmit = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue && !searchQuery) {
      return;
    }
    updateRouteWithQuery(trimmedValue, {
      forceMyJobs: Boolean(trimmedValue),
      method: "push",
    });
  };
  const linkClass =
    "flex items-center gap-2 rounded-full px-3 py-2 text-base font-medium transition-colors";
  const inactiveClass = "text-slate-700 hover:bg-slate-300 hover:text-black";
  const activeClass = "bg-white text-slate-900 shadow-sm";
  const navItems = [
    {
      href: "/dashboard/home",
      label: "Home",
      icon: Home,
      isActive: (path: string) => path === "/dashboard/home",
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: (path: string) => path === "/dashboard",
    },
    {
      href: "/dashboard/my-jobs",
      label: "My Jobs",
      icon: BriefcaseBusiness,
      isActive: (path: string) => path.startsWith("/dashboard/my-jobs"),
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: User,
      isActive: (path: string) => path === "/dashboard/profile",
    },
  ];

  return (
    <div className="flex justify-center bg-[#F0F4F8] px-6 pb-6 md:px-12">
      <div className="flex w-full max-w-8xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Desktop Navigation Links - Hidden on Mobile */}
        <div className="hidden md:flex flex-wrap items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`${linkClass} ${
                  isActive ? activeClass : inactiveClass
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Search Bar - Visible on All Screen Sizes */}
        <div
          className="w-full md:w-[520px]"
          role="search"
          aria-label="Search jobs"
        >
          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
            <div className="relative flex-1">
              <input
                type="search"
                placeholder="Search by job title, company, location, or job type"
                aria-label="Search by job title, company, location, or job type"
                aria-describedby="search-help"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pr-12 text-base text-slate-800 shadow-sm focus:border-[#C27803] focus:outline-none focus:ring-2 focus:ring-[#C27803]/20"
              />
              <Search
                className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-orange-900 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-orange-950 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#C27803]"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Search</span>
            </button>
          </div>
          <p
            id="search-help"
            className="text-xs text-slate-700 w-full mt-1 text-center"
          >
            Press Enter or select Search.
          </p>
        </div>
      </div>
    </div>
  );
}
