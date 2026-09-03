"use client";
/* eslint-disable @next/next/no-img-element -- Profile images are stored external URLs. */

import {
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/components/auth/auth.api";
import {
  authChangeEvent,
  clearSignedInUser,
  getSignedInUser,
} from "@/components/auth/auth.session";

const links = [
  ["Dashboard", "/officer/dashboard", LayoutDashboard],
  ["Check In / Check Out", "/officer/check-in", ClipboardCheck],
] as const;

export function OfficerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(getSignedInUser());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const updateUser = () => setUser(getSignedInUser());
    window.addEventListener(authChangeEvent, updateUser);
    return () => window.removeEventListener(authChangeEvent, updateUser);
  }, []);

  const signOut = async () => {
    try {
      await logout();
    } finally {
      clearSignedInUser();
      router.replace("/login");
    }
  };

  const name = user?.fullName ?? "My Account";
  const account = (
    <div className="relative border-t border-slate-200 p-4">
      {accountOpen && (
        <div className="absolute bottom-full left-4 right-4 z-50 mb-3 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            My Account
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAccountOpen((open) => !open)}
        aria-expanded={accountOpen}
        className="flex w-full items-center gap-3 rounded-lg p-1 text-left hover:bg-slate-50"
      >
        <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-600 text-sm font-semibold text-white">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            name[0]?.toUpperCase()
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900">
            {name}
          </span>
          <span className="block truncate text-xs text-slate-500">
            {user?.employeeId} · OFFICER
          </span>
        </span>
      </button>
    </div>
  );

  const navigation = (mobile = false) => (
    <nav
      className={`flex-1 space-y-1 overflow-y-auto p-3 ${mobile ? "pt-5" : ""}`}
    >
      {links.map(([label, href, Icon]) => (
        <Link
          key={href}
          href={href}
          onClick={() => {
            setMobileOpen(false);
            setAccountOpen(false);
          }}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${pathname === href ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Link href="/officer/dashboard" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white">
            <ShieldCheck className="size-5" />
          </span>
          <span className="text-lg font-bold text-slate-800">Azovis</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="grid size-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/40"
          />
          <aside className="relative flex h-full w-[min(18rem,86vw)] flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <span className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white">
                  <ShieldCheck className="size-5" />
                </span>
                Azovis
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Close navigation menu"
              >
                <X className="size-5" />
              </button>
            </div>
            {navigation(true)}
            {account}
          </aside>
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-20 items-center border-b border-slate-200 px-4">
          <span className="grid size-11 place-items-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck className="size-6" />
          </span>
          <span className="ml-3 text-xl font-bold text-slate-800">Azovis</span>
        </div>
        {navigation()}
        {account}
      </aside>
    </>
  );
}
