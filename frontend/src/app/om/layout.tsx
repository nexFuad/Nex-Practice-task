import type { ReactNode } from "react";
import { OperationsSidebar } from "@/components/dashboard/om/OperationsSidebar";
import { RoleGuard } from "@/components/auth/RoleGuard";
export default function OmLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["OM", "ADMIN"]}><div className="min-h-screen bg-slate-50 lg:flex lg:h-screen lg:overflow-hidden">
      <OperationsSidebar />
      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">{children}</main>
    </div></RoleGuard>
  );
}
