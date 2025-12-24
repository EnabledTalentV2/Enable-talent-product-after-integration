"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import DashBoardNavbar from "@/components/DashBoardNavbar";
import DashboardSubnav from "@/components/DashboardSubnav";
import { useUserDataStore } from "@/lib/userDataStore";
import { getCurrentUser } from "@/lib/localUserStore";

export default function DashboardLayoutPage({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const setUserData = useUserDataStore((s) => s.setUserData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const localUser = getCurrentUser();

      if (!localUser?.userData) {
        router.replace("/login-talent");
        return;
      }

      setUserData((_prev) => localUser.userData);
      setLoading(false);
    };

    checkAuth();
  }, [router, setUserData]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F0F4F8]">
        <div className="text-slate-500">Verifying session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <DashBoardNavbar />
      <DashboardSubnav />
      <main className="px-6 pb-10 md:px-12">{children}</main>
    </div>
  );
}
