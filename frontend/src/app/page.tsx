"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";
import { getSession } from "@/Services/auth";
import { Loading } from "@/components/Shared/Loading";
import {
  clearSignedInUser,
  getSignedInUser,
  hasExplicitLogout,
  setSignedInUser,
} from "../lib/auth.session";
import { LandingPage } from "./public/page";

export default function Home() {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
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
      window.location.replace(data.dashboardPath);
      return;
    }
    if (isError && hasStoredUser) clearSignedInUser();
  }, [data, explicitlyLoggedOut, hasStoredUser, isError]);

  if (!isMounted || (!explicitlyLoggedOut && (isLoading || data))) {
    return <Loading />;
  }

  return <LandingPage />;
}
