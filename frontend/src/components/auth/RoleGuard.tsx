"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getSession } from "./auth.api";
import { setSignedInUser, type SignedInUser } from "./auth.session";

type Role = "ADMIN" | "OM" | "OFFICER";
const dashboardFor = (role: string) => role === "ADMIN" ? "/admin/dashboard" : role === "OFFICER" ? "/officer/dashboard" : "/om/dashboard";

export function RoleGuard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const router = useRouter(); const pathname = usePathname(); const [user, setUser] = useState<SignedInUser | null | undefined>(undefined);
  const rolesKey = roles.join(",");
  useEffect(() => { let active = true; const allowed = rolesKey.split(",") as Role[]; void getSession().then(({ user: sessionUser }) => { if (!active) return; setSignedInUser(sessionUser); setUser(sessionUser); if (!allowed.includes(sessionUser.role as Role)) router.replace(dashboardFor(sessionUser.role)); }).catch(() => { if (active) { setUser(null); router.replace(`/login?next=${encodeURIComponent(pathname)}`); } }); return () => { active = false; }; }, [pathname, rolesKey, router]);
  if (!user || !rolesKey.split(",").includes(user.role)) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Checking access…</div>;
  return <>{children}</>;
}
