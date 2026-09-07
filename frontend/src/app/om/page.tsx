"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getAttendance } from "@/Services/attendance";
import { getSites } from "@/Services/site";
import { getShifts } from "@/Services/shift";
import { getUsers } from "@/Services/user";

const monthKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function OmDashboardPreview() {
  const sites = useQuery({
    queryKey: ["dashboard", "sites"],
    queryFn: () => getSites({ page: 1, pageSize: 1 }),
  });
  const users = useQuery({
    queryKey: ["dashboard", "users"],
    queryFn: () => getUsers({ page: 1, pageSize: 1 }),
  });
  const shifts = useQuery({
    queryKey: ["dashboard", "shifts"],
    queryFn: () => getShifts({ page: 1, pageSize: 1 }),
  });
  const attendance = useQuery({
    queryKey: ["dashboard", "attendance"],
    queryFn: () => getAttendance(monthKey(), "", "", 1, 5),
  });
  const cards = [
    {
      label: "Total Sites",
      value: sites.data?.stats.total ?? 0,
      note: `${sites.data?.stats.active ?? 0} active`,
      href: "/om/site",
      Icon: MapPin,
      tone: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Users",
      value: users.data?.stats.total ?? 0,
      note: `${users.data?.stats.activeOfficers ?? 0} active officers`,
      href: "/om/users",
      Icon: Users,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      label: "Active Shifts",
      value: shifts.data?.stats.active ?? 0,
      note: `${shifts.data?.stats.total ?? 0} configured`,
      href: "/om/shifts",
      Icon: CalendarDays,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "On Duty",
      value: attendance.data?.stats.onDuty ?? 0,
      note: `${attendance.data?.stats.completed ?? 0} completed`,
      href: "/om/attendance",
      Icon: Activity,
      tone: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <section className="space-y-7 p-5 text-slate-800 sm:p-7 lg:p-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Operations overview
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor your security operations at a glance.
          </p>
        </div>
        <Link
          href="/om/users/create-new-employee"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Add employee <ArrowRight className="size-4" />
        </Link>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, href, Icon, tone }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {value}
                </p>
              </div>
              <span
                className={`grid size-11 place-items-center rounded-lg ${tone}`}
              >
                <Icon className="size-5" />
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-500">{note}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent attendance
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest records for this month
              </p>
            </div>
            <Link
              href="/om/attendance"
              className="text-sm font-medium text-blue-600"
            >
              View all
            </Link>
          </header>
          <div className="divide-y divide-slate-100">
            {attendance.data?.records.length ? (
              attendance.data.records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between gap-3 px-5 py-4 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {record.employeeName}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {record.siteName ?? "No site assigned"} ·{" "}
                      {record.shiftDate}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {record.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                No attendance records found.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Quick actions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Common operations shortcuts
          </p>
          <div className="mt-5 space-y-3">
            <QuickAction href="/om/site" label="Manage sites" Icon={MapPin} />
            <QuickAction href="/om/users" label="Manage users" Icon={Users} />
            <QuickAction
              href="/om/shifts"
              label="Manage shifts"
              Icon={CalendarDays}
            />
            <QuickAction
              href="/om/attendance"
              label="Record attendance"
              Icon={Activity}
            />
          </div>
        </section>
      </div>
    </section>
  );
}

function QuickAction({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: typeof MapPin;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
    >
      <span className="flex items-center gap-3">
        <Icon className="size-4 text-blue-600" />
        {label}
      </span>
      <ArrowRight className="size-4 text-slate-400" />
    </Link>
  );
}

export default function OmPage() {
  redirect("/om/site");
}
