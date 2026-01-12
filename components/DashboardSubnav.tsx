"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
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

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    // If user is searching and not on my-jobs or companies page, redirect to my-jobs
    const isOnSearchablePage = pathname.startsWith("/dashboard/my-jobs") ||
                                pathname.startsWith("/dashboard/companies");

    if (value.trim() && !isOnSearchablePage) {
      router.push(`/dashboard/my-jobs?${params.toString()}`);
    } else {
      router.push(`${pathname}?${params.toString()}`);
    }
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
      href: "/dashboard/companies",
      label: "Companies",
      icon: Building2,
      isActive: (path: string) => path.startsWith("/dashboard/companies"),
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
        <div className="w-full md:w-[420px]">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by skills, company or job"
              aria-label="Search by skills, company or job"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  // Ensure search is applied even if already on a searchable page
                  handleSearchChange(searchQuery);
                }
              }}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pr-12 text-base text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <button
              type="button"
              onClick={() => {
                if (searchQuery.trim()) {
                  handleSearchChange(searchQuery);
                }
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
