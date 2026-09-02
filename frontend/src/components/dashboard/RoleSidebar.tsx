"use client";

import { Building2, CalendarDays, ClipboardCheck, FileText, LayoutDashboard, LogOut, Megaphone, Settings, ShieldCheck, UserRound, Users, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/components/auth/auth.api";
import { authChangeEvent, clearSignedInUser, getSignedInUser } from "@/components/auth/auth.session";

const adminLinks = [["Dashboard", "/admin/dashboard", LayoutDashboard], ["Company Settings", "/admin/company-settings", Building2], ["User & Role Management", "/admin/users", Users], ["Sites", "/admin/sites", Building2], ["Shift Types", "/admin/shift-types", CalendarDays], ["Role Permissions", "/admin/role-permissions", ShieldCheck], ["System Settings", "/admin/system-settings", Settings], ["Audit Logs", "/admin/audit-logs", FileText], ["Profile", "/admin/profile", UserRound]] as const;
const officerLinks = [["Dashboard", "/officer/dashboard", LayoutDashboard], ["My Profile", "/officer/profile", UserRound], ["My Schedule / Roster", "/officer/schedule", CalendarDays], ["My Attendance", "/officer/attendance", ClipboardCheck], ["Check In / Check Out", "/officer/check-in", ClipboardCheck], ["My Payslips", "/officer/payslips", WalletCards], ["My Leave Requests", "/officer/leave-requests", FileText], ["Announcements", "/officer/announcements", Megaphone]] as const;

export function RoleSidebar({ role }: { role: "ADMIN" | "OFFICER" }) {
  const pathname = usePathname(); const router = useRouter(); const [user, setUser] = useState(getSignedInUser()); const links = role === "ADMIN" ? adminLinks : officerLinks;
  useEffect(() => { const update = () => setUser(getSignedInUser()); window.addEventListener(authChangeEvent, update); return () => window.removeEventListener(authChangeEvent, update); }, []);
  const signOut = async () => { try { await logout(); } finally { clearSignedInUser(); router.replace("/login"); } };
  const name = user?.fullName ?? "My Account";
  return <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col"><div className="flex h-20 items-center border-b border-slate-200 px-4"><span className="grid size-11 place-items-center rounded-xl bg-blue-600 text-white"><ShieldCheck className="size-6" /></span><span className="ml-3 text-xl font-bold text-slate-800">Azovis</span></div><nav className="flex-1 space-y-1 overflow-y-auto p-3">{links.map(([label, href, Icon]) => <Link key={href} href={href} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] ${pathname === href ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-100"}`}><Icon className="size-4" />{label}</Link>)}</nav><div className="border-t border-slate-200 p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center overflow-hidden rounded-full bg-blue-600 text-sm font-semibold text-white">{user?.profileImageUrl ? <img src={user.profileImageUrl} alt="" className="size-full object-cover" /> : name[0]?.toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{name}</p><p className="truncate text-xs text-slate-500">{user?.employeeId} · {role}</p></div></div><button type="button" onClick={() => void signOut()} className="mt-3 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="size-4" />Logout</button></div></aside>;
}
