"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getCurrentEmployer } from "@/lib/localEmployerStore";
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
    const currentEmployer = getCurrentEmployer();

    if (!currentEmployer?.email) {
      router.replace("/login-employer");
      return;
    }

    fetchJobs()
      .catch(() => {})
      .finally(() => setLoading(false));
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
      {children}
    </div>
  );
}
