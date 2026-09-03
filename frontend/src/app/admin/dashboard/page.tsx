"use client";
import { Building2, CalendarDays, ShieldCheck, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
type Summary = {
  users: number;
  omUsers: number;
  officers: number;
  sites: number;
  shifts: number;
};
const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
export default function AdminDashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard", "admin", "summary"],
    queryFn: async () => {
      const response = await fetch(`${api}/api/dashboard/admin/summary`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load dashboard summary.");
      return response.json() as Promise<Summary>;
    },
  });
  const cards = [
    ["Total Users", data?.users ?? "…", "All registered users", Users],
    [
      "Total OM Users",
      data?.omUsers ?? "…",
      "Operations managers",
      ShieldCheck,
    ],
    ["Total Officers", data?.officers ?? "…", "Officer accounts", Users],
    [
      "Active Sites",
      data?.sites ?? "…",
      "Available operational sites",
      Building2,
    ],
    [
      "Active Shifts",
      data?.shifts ?? "…",
      "Configured shift types",
      CalendarDays,
    ],
  ] as const;
  return (
    <section className="p-5 sm:p-7 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
      <p className="mt-1 text-base text-slate-500">
        Organisation and system management overview.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([title, value, caption, Icon]) => (
          <article
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">{title}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{caption}</p>
              </div>
              <span className="grid size-12 place-items-center rounded-xl bg-blue-100 text-blue-600">
                <Icon className="size-6" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
