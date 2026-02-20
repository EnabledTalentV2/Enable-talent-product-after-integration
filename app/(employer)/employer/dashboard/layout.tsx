"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import DashboardSubNavEmployer from "@/components/DashBoardSubNavEmployer";
import DashBoardNavbarEmployer from "@/components/DashBaordNavbarEmployer";
import Breadcrumb from "@/components/a11y/Breadcrumb";
import SessionExpiryWarning from "@/components/a11y/SessionExpiryWarning";
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

      // After setActive() on the login page, Clerk's client-side
      // isSignedIn may briefly be false before it syncs. Don't redirect
      // based on isSignedIn alone — try the API call first so we don't
      // create a redirect loop (dashboard → login → dashboard).
      const maxRetries = 4;
      const delayMs = [0, 1500, 2500, 3500];

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (!active) return;

        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, delayMs[attempt]));
          if (!active) return;
        }

        try {
          const response = await fetch("/api/user/me", {
            credentials: "include",
          });

          if (response.ok) {
            if (active) {
              fetchJobs()
                .catch(() => {})
                .finally(() => {
                  if (active) setLoading(false);
                });
            }
            return;
          }

          // Retryable server errors (401 = no session yet, 500 = token not ready)
          if ((response.status === 401 || response.status === 500) && attempt < maxRetries - 1) {
            continue;
          }

          // Final attempt failed — redirect to login
          router.replace("/login-employer");
          return;
        } catch (error) {
          console.error("Auth check failed:", error);
          if (attempt < maxRetries - 1) continue;
          router.replace("/login-employer");
          return;
        }
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- isSignedIn kept for array size stability; auth is verified via API call
  }, [isLoaded, isSignedIn, fetchJobs, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F0F4F8]">
        <div className="text-slate-700">Verifying session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF5FF] flex flex-col">
      <DashBoardNavbarEmployer />
      <DashboardSubNavEmployer />
      <Breadcrumb />
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
      <SessionExpiryWarning loginPath="/login-employer" />
    </div>
  );
}
