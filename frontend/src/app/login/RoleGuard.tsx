"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { getSession } from "@/Services/auth";
import { setSignedInUser, type SignedInUser } from "./auth.session";

type Role = "ADMIN" | "OM" | "OFFICER";
const dashboardFor = (role: string) =>
  role === "OFFICER" ? "/officer/check-in" : "/om/site";

export function RoleGuard({
  roles,
  children,
}: {
  roles: Role[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const rolesKey = roles.join(",");
  const { data, isLoading } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: getSession,
    retry: false,
  });
  const user: SignedInUser | null | undefined = data?.user;
  useEffect(() => {
    const allowed = rolesKey.split(",") as Role[];
    if (isLoading) return;
    if (!user) {
      window.location.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setSignedInUser(user);
    if (!allowed.includes(user.role as Role))
      window.location.replace(dashboardFor(user.role));
  }, [isLoading, pathname, rolesKey, user]);
  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
        Checking access…
      </div>
    );
  }
  if (!user || !rolesKey.split(",").includes(user.role)) return null;
  return <>{children}</>;
}
