"use client";
/* eslint-disable @next/next/no-img-element -- Profile URLs are user-provided and may use the configured remote image host. */

import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  MapPin,

  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  authChangeEvent,
  clearSignedInUser,
  getSignedInUser,
  type SignedInUser,
} from "@/components/auth/auth.session";
import { logout } from "@/components/auth/auth.api";

const links = [
  ["Dashboard", "/om/dashboard", LayoutDashboard],
  ["Sites", "/om/sites", MapPin],
  ["Users", "/om/users", Users],
  ["Shift", "/om/shift", CalendarDays],
] as const;
type IconType = typeof LayoutDashboard;
function NavLink({
  collapsed,
  active,
  href,
  label,
  Icon,
}: {
  collapsed: boolean;
  active: boolean;
  href: string;
  label: string;
  Icon: IconType;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition ${active ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-100"}`}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
export function OperationsSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [hrOpen, setHrOpen] = useState(pathname.startsWith("/om/hr"));
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SignedInUser | null>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const active = (href: string) => pathname === href;
  useEffect(() => {
    const update = () => setUser(getSignedInUser());
    update();
    window.addEventListener(authChangeEvent, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(authChangeEvent, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  useEffect(() => {
    if (!accountOpen) return;
    const close = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [accountOpen]);
  const name = user?.fullName ?? "My Account";
  const initial = name.charAt(0).toUpperCase() || "U";
  const subtitle = user?.employeeId ?? "";
  const role = user?.role?.replace(" Demo", "") || "";
  const signOut = async () => {
    try { await logout(); } catch { /* Clear local UI session even if the server session expired. */ }
    clearSignedInUser();
    router.push("/");
  };
  const avatar = (
    <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-600 text-sm font-semibold text-white">
      {user?.profileImageUrl ? (
        <img
          src={user.profileImageUrl}
          alt=""
          className="size-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  );
  const mobileNavigation = (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3 pt-5">
      {links.slice(0, 4).map(([label, href, Icon]) => (
        <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${active(href) ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-100"}`}><Icon className="size-4" />{label}</Link>
      ))}
      <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">HR</p>
      <Link href="/om/hr/attendance" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${active("/om/hr/attendance") ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-100"}`}><Users className="size-4" />Attendance</Link>
    </nav>
  );
  const mobileAccount = <div className="border-t border-slate-200 p-4"><div className="flex items-center gap-3">{avatar}<div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{name}{role ? ` (${role})` : ""}</p><p className="truncate text-xs text-slate-500">{subtitle}</p></div></div><Link href="/om/profile" onClick={() => setMobileOpen(false)} className="mt-3 flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"><Settings className="size-4" />Account Settings</Link><button onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50"><LogOut className="size-4" />Logout</button></div>;
  return (
    <>
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
      <Link href="/om/dashboard" className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white"><ShieldCheck className="size-5" /></span><span className="text-lg font-bold text-slate-800">Azovis</span></Link>
      <button type="button" onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100" aria-label="Open navigation menu"><Menu className="size-5" /></button>
    </header>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Close navigation menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-slate-950/40" /><aside className="relative flex h-full w-[min(18rem,86vw)] flex-col bg-white shadow-2xl"><div className="flex h-16 items-center justify-between border-b border-slate-200 px-4"><span className="flex items-center gap-2.5 text-lg font-bold text-slate-800"><span className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white"><ShieldCheck className="size-5" /></span>Azovis</span><button type="button" onClick={() => setMobileOpen(false)} className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Close navigation menu"><X className="size-5" /></button></div>{mobileNavigation}{mobileAccount}</aside></div>}
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 border-r border-slate-200 bg-white transition-[width] duration-200 lg:block ${collapsed ? "w-20" : "w-64"}`}
    >
      <div className="flex h-20 items-center border-b border-slate-200 px-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white">
          <ShieldCheck className="size-6" />
        </span>
        {!collapsed && (
          <span className="ml-3 text-xl font-bold text-slate-800">Azovis</span>
        )}
        <button
          onClick={() => setCollapsed((value) => !value)}
          className="ml-auto grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-5" />
          ) : (
            <ChevronLeft className="size-5" />
          )}
        </button>
      </div>
      <nav className="space-y-1 p-3">
        {links.slice(0, 4).map(([label, href, Icon]) => (
          <NavLink
            key={href}
            collapsed={collapsed}
            active={active(href)}
            href={href}
            label={label}
            Icon={Icon}
          />
        ))}
        <button
          onClick={() => setHrOpen((value) => !value)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] ${pathname.startsWith("/om/hr") ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Users className="size-4 shrink-0" />
          {!collapsed && (
            <>
              <span>HR</span>
              <ChevronDown
                className={`ml-auto size-4 transition ${hrOpen ? "rotate-180" : ""}`}
              />
            </>
          )}
        </button>
        {hrOpen && !collapsed && (
          <Link
            href="/om/hr/attendance"
            className={`ml-7 flex rounded-lg px-2.5 py-1.5 text-[13px] ${active("/om/hr/attendance") ? "font-semibold text-blue-600" : "text-slate-500 hover:bg-slate-100"}`}
          >
            Attendance
          </Link>
        )}
        {links.slice(4).map(([label, href, Icon]) => (
          <NavLink
            key={href}
            collapsed={collapsed}
            active={active(href)}
            href={href}
            label={label}
            Icon={Icon}
          />
        ))}
      </nav>
      <div className="absolute bottom-0 w-full border-t border-slate-200 p-4">
        {collapsed ? (
          avatar
        ) : (
          <div ref={accountRef} className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((value) => !value)}
              className="flex w-full items-center gap-3 rounded-lg text-left"
            >
              <>{avatar}</>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {name}
                  {role ? ` (${role})` : ""}
                </p>
                <p className="truncate text-xs text-slate-500">{subtitle}</p>
              </div>
            </button>
            {accountOpen && (
              <div className="absolute bottom-12 left-0 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                <p className="border-b border-slate-100 px-4 py-2 text-sm font-medium text-slate-800">
                  My Account
                </p>
                <Link
                  href="/om/profile"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="size-4" />
                  Account Settings
                </Link>
                <button
                  onClick={() => void signOut()}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
