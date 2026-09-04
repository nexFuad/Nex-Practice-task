import type { ReactNode } from "react";
import { RoleGuard } from "@/app/login/RoleGuard";
import { DashboardSidebar } from "@/Shared/DashboardSidebar";
export default function OfficerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["OFFICER"]}>
      <div className="min-h-screen bg-slate-50 lg:flex lg:h-screen lg:overflow-hidden">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
