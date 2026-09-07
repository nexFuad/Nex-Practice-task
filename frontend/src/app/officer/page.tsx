"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { DashboardSidebar } from "@/components/Shared/DashboardSidebar";
import OfficerCheckInRoute from "@/components/Officer/check-in/page";
import { getSession } from "@/Services/auth";
import { setSignedInUser, type SignedInUser } from "@/lib/auth.session";
import { Loading } from "@/components/Shared/Loading";

export default function OfficerPage() {
  const pathname = usePathname();
  const { data, isLoading } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: getSession,
    retry: false,
  });
  const user: SignedInUser | null | undefined = data?.user;

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      window.location.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setSignedInUser(user);
    if (user.role !== "OFFICER") window.location.replace("/om/site");
  }, [isLoading, pathname, user]);

  if (isLoading) {
    return <Loading />;
  }
  if (!user || user.role !== "OFFICER") return null;

  return (
    <div className="min-h-screen bg-slate-50 lg:flex lg:h-screen lg:overflow-hidden">
      <DashboardSidebar />
      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        <OfficerCheckInRoute />
      </main>
    </div>
  );
}
