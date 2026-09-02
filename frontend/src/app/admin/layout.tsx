import type { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { RoleSidebar } from "@/components/dashboard/RoleSidebar";
export default function AdminLayout({ children }: { children: ReactNode }) { return <RoleGuard roles={["ADMIN"]}><div className="min-h-screen bg-slate-50 lg:flex"><RoleSidebar role="ADMIN" /><main className="min-w-0 flex-1">{children}</main></div></RoleGuard>; }
