"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import DashboardSubNavEmployer from "@/components/DashBoardSubNavEmployer";
import DashBoardNavbarEmployer from "@/components/DashBaordNavbarEmployer";
import { useEmployerJobsStore } from "@/lib/employerJobsStore";
import { useEmployerDataStore } from "@/lib/employerDataStore";

export default function EmployerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const fetchJobs = useEmployerJobsStore((state) => state.fetchJobs);
  const setEmployerData = useEmployerDataStore((s) => s.setEmployerData);

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

        const data = await response.json();
        if (active) {
          setEmployerData(() => data);
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
  }, [fetchJobs, router, setEmployerData]);

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
      {children}
    </div>
  );
}
