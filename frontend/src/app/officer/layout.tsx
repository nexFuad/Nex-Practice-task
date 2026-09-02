import type { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { RoleSidebar } from "@/components/dashboard/RoleSidebar";
export default function OfficerLayout({ children }: { children: ReactNode }) { return <RoleGuard roles={["OFFICER"]}><div className="min-h-screen bg-slate-50 lg:flex"><RoleSidebar role="OFFICER" /><main className="min-w-0 flex-1">{children}</main></div></RoleGuard>; }
