"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import DashboardSubNavEmployer from "@/components/DashBoardSubNavEmployer";
import DashBoardNavbarEmployer from "@/components/DashBaordNavbarEmployer";
import { useEmployerJobsStore } from "@/lib/employerJobsStore";

export default function EmployerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const fetchJobs = useEmployerJobsStore((state) => state.fetchJobs);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user/me", {
          credentials: "include",
        });

        if (response.status === 401) {
          router.replace("/login-employer");
          return;
        }

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
  }, [fetchJobs, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F0F4F8]">
        <div className="text-slate-500">Verifying session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF5FF]">
      <DashBoardNavbarEmployer />
      <DashboardSubNavEmployer />
      <main id="main-content" aria-labelledby="employer-dashboard-heading">
        {/* Screen reader only heading for accessibility - WCAG 2.4.1, 2.4.2 */}
        <h1 id="employer-dashboard-heading" className="sr-only">
          Employer Dashboard
        </h1>
        {children}
      </main>
    </div>
  );
}
