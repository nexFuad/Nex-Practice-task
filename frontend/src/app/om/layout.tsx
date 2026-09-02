import type { ReactNode } from "react";
import { OperationsSidebar } from "@/components/dashboard/OperationsSidebar";
import { RoleGuard } from "@/components/auth/RoleGuard";
export default function OmLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["OM"]}><div className="min-h-screen bg-slate-50 lg:flex">
      <OperationsSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div></RoleGuard>
  );
}
