"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import DashboardSubNavEmployer from "@/components/DashBoardSubNavEmployer";
import DashBoardNavbarEmployer from "@/components/DashBaordNavbarEmployer";
import { useEmployerJobsStore } from "@/lib/employerJobsStore";

export default function EmployerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const fetchJobs = useEmployerJobsStore((state) => state.fetchJobs);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      // Wait for Clerk auth to load
      if (!isLoaded) return;

      // Redirect if not signed in
      if (!isSignedIn) {
        router.replace("/login-employer");
        return;
      }

      try {
        const response = await fetch("/api/user/me", {
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/login-employer");
          return;
        }

        if (active) {
          // Fetch jobs after auth is confirmed
          fetchJobs()
            .catch(() => {})
            .finally(() => {
              if (active) setLoading(false);
            });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/login-employer");
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn, fetchJobs, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F0F4F8]">
        <div className="text-slate-500">Verifying session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF5FF] flex flex-col">
      <DashBoardNavbarEmployer />
      <DashboardSubNavEmployer />
      <main
        id="main-content"
        aria-labelledby="employer-dashboard-heading"
        className="flex-1 min-h-0"
      >
        {/* Screen reader only heading for accessibility - WCAG 2.4.1, 2.4.2 */}
        <h1 id="employer-dashboard-heading" className="sr-only">
          Employer Dashboard
        </h1>
        {children}
      </main>
    </div>
  );
}
