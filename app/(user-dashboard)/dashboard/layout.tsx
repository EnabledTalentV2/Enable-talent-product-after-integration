import type { ReactNode } from "react";
import DashBoardNavbar from "@/components/DashBoardNavbar";
import DashboardSubnav from "@/components/DashboardSubnav";

export default function DashboardLayoutPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <DashBoardNavbar />
      <DashboardSubnav />
      <main className="px-6 pb-10 md:px-12">{children}</main>
    </div>
  );
}
