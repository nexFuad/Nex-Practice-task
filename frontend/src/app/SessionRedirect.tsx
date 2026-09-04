"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { getSession } from "@/Services/auth";
import {
  clearSignedInUser,
  getSignedInUser,
  hasExplicitLogout,
  setSignedInUser,
} from "./login/auth.session";

/** Redirects an authenticated user before they can use public/login pages. */
export function SessionRedirect({ children }: { children: ReactNode }) {
  const router = useRouter();
  const explicitlyLoggedOut = hasExplicitLogout();
  const hasStoredUser = Boolean(getSignedInUser());
  const { data, isError, isLoading } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: getSession,
    retry: false,
  });

  useEffect(() => {
    if (explicitlyLoggedOut) return;
    if (data) {
      setSignedInUser(data.user);
      router.replace(data.dashboardPath);
      return;
    }
    if (isError && hasStoredUser) clearSignedInUser();
  }, [data, explicitlyLoggedOut, hasStoredUser, isError, router]);

  // Do not flash the landing/login page until the server has validated a saved session.
  if (!explicitlyLoggedOut && (isLoading || data)) {
    return (
      <main
        className="grid min-h-screen place-items-center bg-white"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <span className="size-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          Loading your workspace…
        </div>
      </main>
    );
  }
  return <>{children}</>;
}
