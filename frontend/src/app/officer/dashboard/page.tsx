"use client";
import { CalendarDays, ClipboardCheck, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
type Overview = {
  employee: {
    fullName: string;
    employeeId: string;
    sites: { name: string; code: string }[];
  };
  attendance: {
    id: string;
    shiftDate: string;
    shiftStart: string;
    shiftEnd: string;
    status: string;
    siteName?: string | null;
  }[];
};
const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
export default function OfficerDashboardPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["dashboard", "officer", "overview"],
    queryFn: async () => {
      const response = await fetch(`${api}/api/dashboard/officer/overview`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load your dashboard.");
      return response.json() as Promise<Overview>;
    },
  });
  const latest = data?.attendance[0];
  return (
    <section className="p-5 sm:p-7 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-800">My Dashboard</h1>
      <p className="mt-1 text-base text-slate-500">
        Your assigned work and attendance overview.
      </p>
      {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Today’s assigned shift"
            value={
              latest
                ? `${latest.shiftStart} – ${latest.shiftEnd}`
                : "No shift assigned"
            }
            Icon={CalendarDays}
          />
          <Card
            title="Assigned site / post"
            value={data?.employee.sites[0]?.name ?? "Unassigned"}
            Icon={MapPin}
          />
          <Card
            title="Check-in status"
            value={latest?.status?.replaceAll("_", " ") ?? "Not checked in"}
            Icon={ClipboardCheck}
          />
        </div>
      )}
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">
          Recent attendance
        </h2>
        {isLoading ? (
          <div aria-busy="true" className="mt-4 animate-pulse space-y-3">
            {[0, 1, 2].map((row) => (
              <div key={row} className="h-10 rounded bg-slate-100" />
            ))}
          </div>
        ) : data?.attendance.length ? (
          <div className="mt-4 divide-y divide-slate-100">
            {data.attendance.map((record) => (
              <div
                key={record.id}
                className="flex flex-wrap justify-between gap-2 py-3 text-sm"
              >
                <span>
                  {new Date(record.shiftDate).toLocaleDateString("en-GB")} ·{" "}
                  {record.siteName ?? "Unassigned"}
                </span>
                <span className="font-medium text-slate-700">
                  {record.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No attendance records yet.
          </p>
        )}
      </section>
    </section>
  );
}
function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="mt-7 grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((card) => (
        <article key={card} className="h-31.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="mt-4 h-6 w-44 rounded bg-slate-100" />
        </article>
      ))}
    </div>
  );
}
function Card({
  title,
  value,
  Icon,
}: {
  title: string;
  value: string;
  Icon: typeof CalendarDays;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-3 text-xl font-bold text-slate-900">{value}</p>
        </div>
        <span className="grid size-12 place-items-center rounded-xl bg-blue-100 text-blue-600">
          <Icon className="size-6" />
        </span>
      </div>
    </article>
  );
}
