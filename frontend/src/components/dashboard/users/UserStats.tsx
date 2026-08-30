import { Activity, ShieldCheck, UserCheck, Users } from "lucide-react";

const cards = [
  ["Total Users", "All registered users", Users, "text-blue-600", ""],
  ["Active Officers", "Currently active", ShieldCheck, "text-emerald-600", "↑ 12%"],
  ["Operations Managers", "OM accounts", UserCheck, "text-slate-600", ""],
  ["On Duty Now", "Currently working", Activity, "text-amber-500", ""],
] as const;

export function UserStats({ total, activeOfficers, operationManagers }: { total: number; activeOfficers: number; operationManagers: number }) {
  const values = [total, activeOfficers, operationManagers, 1];
  return <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([title, caption, Icon, iconClass, trend], index) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-600">{title}</p><p className="mt-3 text-3xl font-bold text-slate-900">{values[index]}</p><p className="mt-2 text-sm text-slate-500">{caption}</p>{trend && <p className="mt-3 text-sm text-emerald-600">{trend} <span className="ml-1 text-slate-500">from last week</span></p>}</div><span className={`grid size-12 place-items-center rounded-xl bg-blue-100 ${iconClass}`}><Icon className="size-6" /></span></div></article>)}</section>;
}
