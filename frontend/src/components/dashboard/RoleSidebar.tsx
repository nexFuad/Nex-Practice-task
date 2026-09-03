"use client";
/* eslint-disable @next/next/no-img-element -- Profile URLs are user-provided and may use the configured remote image host. */

import { Building2, CalendarDays, ClipboardCheck, FileText, LayoutDashboard, LogOut, Menu, Megaphone, Settings, ShieldCheck, UserRound, Users, WalletCards, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/components/auth/auth.api";
import { authChangeEvent, clearSignedInUser, getSignedInUser } from "@/components/auth/auth.session";

const adminLinks = [["Dashboard", "/admin/dashboard", LayoutDashboard], ["Company Settings", "/admin/company-settings", Building2], ["User & Role Management", "/admin/users", Users], ["Sites", "/admin/sites", Building2], ["Shift Types", "/admin/shift-types", CalendarDays], ["Role Permissions", "/admin/role-permissions", ShieldCheck], ["System Settings", "/admin/system-settings", Settings], ["Audit Logs", "/admin/audit-logs", FileText], ["Profile", "/admin/profile", UserRound]] as const;
const officerLinks = [["Dashboard", "/officer/dashboard", LayoutDashboard], ["My Profile", "/officer/profile", UserRound], ["My Schedule / Roster", "/officer/schedule", CalendarDays], ["My Attendance", "/officer/attendance", ClipboardCheck], ["Check In / Check Out", "/officer/check-in", ClipboardCheck], ["My Payslips", "/officer/payslips", WalletCards], ["My Leave Requests", "/officer/leave-requests", FileText], ["Announcements", "/officer/announcements", Megaphone]] as const;

export function RoleSidebar({ role }: { role: "ADMIN" | "OFFICER" }) {
  const pathname = usePathname(); const router = useRouter(); const [user, setUser] = useState(getSignedInUser()); const [mobileOpen, setMobileOpen] = useState(false); const links = role === "ADMIN" ? adminLinks : officerLinks;
  useEffect(() => { const update = () => setUser(getSignedInUser()); window.addEventListener(authChangeEvent, update); return () => window.removeEventListener(authChangeEvent, update); }, []);
  const signOut = async () => { try { await logout(); } finally { clearSignedInUser(); router.replace("/login"); } };
  const name = user?.fullName ?? "My Account";
  const navigation = (mobile = false) => <nav className={`flex-1 space-y-1 overflow-y-auto p-3 ${mobile ? "pt-5" : ""}`}>{links.map(([label, href, Icon]) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${pathname === href ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-100"}`}><Icon className="size-4" />{label}</Link>)}</nav>;
  const account = <div className="border-t border-slate-200 p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center overflow-hidden rounded-full bg-blue-600 text-sm font-semibold text-white">{user?.profileImageUrl ? <img src={user.profileImageUrl} alt="" className="size-full object-cover" /> : name[0]?.toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{name}</p><p className="truncate text-xs text-slate-500">{user?.employeeId} · {role}</p></div></div><button type="button" onClick={() => void signOut()} className="mt-3 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="size-4" />Logout</button></div>;
  return <>
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
      <Link href={role === "ADMIN" ? "/admin/dashboard" : "/officer/dashboard"} className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white"><ShieldCheck className="size-5" /></span><span className="text-lg font-bold text-slate-800">Azovis</span></Link>
      <button type="button" onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100" aria-label="Open navigation menu"><Menu className="size-5" /></button>
    </header>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Close navigation menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-slate-950/40" /><aside className="relative flex h-full w-[min(18rem,86vw)] flex-col bg-white shadow-2xl"><div className="flex h-16 items-center justify-between border-b border-slate-200 px-4"><span className="flex items-center gap-2.5 text-lg font-bold text-slate-800"><span className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white"><ShieldCheck className="size-5" /></span>Azovis</span><button type="button" onClick={() => setMobileOpen(false)} className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Close navigation menu"><X className="size-5" /></button></div>{navigation(true)}{account}</aside></div>}
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col"><div className="flex h-20 items-center border-b border-slate-200 px-4"><span className="grid size-11 place-items-center rounded-xl bg-blue-600 text-white"><ShieldCheck className="size-6" /></span><span className="ml-3 text-xl font-bold text-slate-800">Azovis</span></div>{navigation()}{account}</aside>
  </>;
}
