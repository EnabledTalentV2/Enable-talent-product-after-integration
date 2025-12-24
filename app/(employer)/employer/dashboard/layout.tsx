"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getCurrentEmployer } from "@/lib/localEmployerStore";
import DashBoardNavbar from "@/components/DashBaordNavbarEmployer";
import DashboardSubNavEmployer from "@/components/DashBoardSubNavEmployer";
import DashBoardNavbarEmployer from "@/components/DashBaordNavbarEmployer";
export default function EmployerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentEmployer = getCurrentEmployer();

    if (!currentEmployer?.email) {
      router.replace("/login-employer");
      return;
    }

    setLoading(false);
  }, [router]);

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
