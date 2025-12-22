'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, Building2, Home, LayoutDashboard, Search, User } from "lucide-react";

export default function DashboardSubnav() {
  const pathname = usePathname();
  const linkClass = "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors";
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
      href: "/dashboard/profile-update",
      label: "Profile",
      icon: User,
      isActive: (path: string) => path.startsWith("/dashboard/profile-update"),
    },
  ];

  return (
    <div className="flex justify-center bg-[#F0F4F8] px-6 pb-6 md:px-12">
      <div className="flex w-full max-w-8xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`${linkClass} ${isActive ? activeClass : inactiveClass}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="w-full md:w-[420px]">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by skills, company or job"
              aria-label="Search by skills, company or job"
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pr-12 text-sm text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
