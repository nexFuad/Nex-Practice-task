import type { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { OfficerSidebar } from "@/components/dashboard/officer/OfficerSidebar";
export default function OfficerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["OFFICER"]}>
      <div className="min-h-screen bg-slate-50 lg:flex lg:h-screen lg:overflow-hidden">
        <OfficerSidebar />
        <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">{children}</main>
      </div>
    </RoleGuard>
  );
}
