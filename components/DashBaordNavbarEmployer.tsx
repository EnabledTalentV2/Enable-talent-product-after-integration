"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  BriefcaseBusiness,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useEmployerJobsStore } from "@/lib/employerJobsStore";
import { useEmployerDataStore } from "@/lib/employerDataStore";
import { useState } from "react";

export default function DashBoardNavbarEmployer() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useClerk();
  const resetEmployerData = useEmployerDataStore((s) => s.resetEmployerData);
  const resetJobs = useEmployerJobsStore((s) => s.resetJobs);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      resetEmployerData();
      resetJobs();
      router.push("/login-employer");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if Clerk logout fails, clear local data and redirect
      resetEmployerData();
      resetJobs();
      router.push("/login-employer");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
      isActive: (path: string) =>
        path.startsWith("/employer/dashboard/candidates"),
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
      isActive: (path: string) =>
        path.startsWith("/employer/dashboard/company-profile"),
    },
  ];

  return (
    <>
      <nav className="flex h-20 items-center justify-center bg-[#EEF5FF] px-6 md:px-12">
        <div className="flex w-full max-w-8xl items-center justify-between">
          <a
            href="https://www.enabledtalent.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3"
            aria-label="Enabled Talent - opens main website in new tab"
          >
            <Image
              src="/logo/et-new.svg"
              alt=""
              width={150}
              height={40}
              priority
              className="h-10 w-auto object-contain"
              aria-hidden="true"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-7 md:flex">
            <Link
              href="/employer/dashboard/company-profile"
              aria-current={
                pathname.startsWith("/employer/dashboard/company-profile")
                  ? "page"
                  : undefined
              }
              className="flex items-center gap-2 text-base font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              <User size={18} aria-hidden="true" />
              <span>Profile</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-base font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              <LogOut size={18} aria-hidden="true" />
              <span>Log Out</span>
            </button>
            <Link
              href="/employer/dashboard/post-jobs"
              aria-current={
                pathname === "/employer/dashboard/post-jobs"
                  ? "page"
                  : undefined
              }
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C05621] to-[#FBBF24] px-5 py-2.5 text-base font-semibold text-white shadow-md transition-opacity hover:opacity-90"
            >
              <span>Post a Job</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="flex items-center text-slate-600 transition-colors hover:text-slate-900 md:hidden"
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation-menu-employer"
          >
            {isMenuOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden"
          onClick={toggleMenu}
          role="presentation"
        >
          <nav
            id="mobile-navigation-menu-employer"
            className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col p-6">
              <button
                type="button"
                onClick={toggleMenu}
                className="self-end text-slate-600 transition-colors hover:text-slate-900 mb-6"
                aria-label="Close menu"
              >
                <X size={24} aria-hidden="true" />
              </button>

              <div className="flex flex-col gap-4">
                {/* Navigation Links */}
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.isActive(pathname);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-3 px-4 py-3 text-base font-medium transition-colors rounded-lg ${
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                      onClick={toggleMenu}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* Divider */}
                <div
                  className="border-t border-slate-200 my-2"
                  role="separator"
                />

                {/* Post a Job */}
                <Link
                  href="/employer/dashboard/post-jobs"
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-100 rounded-lg"
                  onClick={toggleMenu}
                >
                  <BriefcaseBusiness size={18} aria-hidden="true" />
                  <span>Post a Job</span>
                </Link>

                {/* Divider */}
                <div
                  className="border-t border-slate-200 my-2"
                  role="separator"
                />

                {/* Log Out */}
                <button
                  type="button"
                  onClick={() => {
                    toggleMenu();
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-left text-base font-medium text-red-600 transition-colors hover:bg-red-50 rounded-lg"
                >
                  <LogOut size={18} aria-hidden="true" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
