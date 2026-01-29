"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut,
  Search,
  User,
  Menu,
  X,
  Home,
  LayoutDashboard,
  BriefcaseBusiness,
} from "lucide-react";
import { useUserDataStore } from "@/lib/userDataStore";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { useState, useEffect, useRef } from "react";

export default function DashBoardNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const resetUserData = useUserDataStore((s) => s.resetUserData);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key to close menu
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isMenuOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const focusableElements = menu.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => document.removeEventListener("keydown", handleTabKey);
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      resetUserData();
      router.push("/login-talent");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
  ];

  return (
    <>
      <nav className="flex h-20 items-center justify-center bg-[#F0F4F8] px-6 md:px-12">
        <div className="flex w-full max-w-8xl items-center justify-between">
          <a
            href="https://enabled-talent-landing-v2.vercel.app/"
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
              href="/dashboard/profile"
              aria-current={pathname === "/dashboard/profile" ? "page" : undefined}
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
              href="/dashboard/career-coach/start"
              aria-current={pathname.startsWith("/dashboard/career-coach") ? "page" : undefined}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C05621] to-[#FBBF24] px-5 py-2.5 text-base font-semibold text-white shadow-md transition-opacity hover:opacity-90"
            >
              <Search size={18} strokeWidth={3} aria-hidden="true" />
              <span>AI Career Coach</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={toggleMenu}
            className="flex items-center text-slate-600 transition-colors hover:text-slate-900 md:hidden"
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={toggleMenu}
          role="presentation"
        >
          <nav
            ref={menuRef}
            id="mobile-navigation-menu"
            role="navigation"
            aria-label="Mobile navigation"
            className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <span className="text-lg font-semibold text-slate-900">Menu</span>
                <button
                  type="button"
                  onClick={toggleMenu}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="px-3 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.isActive(pathname);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 text-base font-medium transition-colors rounded-xl ${
                          isActive
                            ? "bg-orange-50 text-orange-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                        onClick={toggleMenu}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="my-4 mx-5 border-t border-slate-100" />

                <div className="px-3 space-y-1">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 rounded-xl"
                    onClick={toggleMenu}
                  >
                    <User size={20} />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/dashboard/career-coach/start"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 rounded-xl"
                    onClick={toggleMenu}
                  >
                    <Search size={20} />
                    <span>AI Career Coach</span>
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    toggleMenu();
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <LogOut size={20} />
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
