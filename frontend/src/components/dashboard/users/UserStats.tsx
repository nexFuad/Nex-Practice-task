import { Activity, ShieldCheck, UserCheck, Users } from "lucide-react";

const cards = [
  ["Total Users", "All registered users", Users, "text-blue-600", ""],
  [
    "Active Officers",
    "Currently active",
    ShieldCheck,
    "text-emerald-600",
    "↑ 12%",
  ],
  ["Operations Managers", "OM accounts", UserCheck, "text-slate-600", ""],
  ["On Duty Now", "Currently working", Activity, "text-amber-500", ""],
] as const;

export function UserStats({
  total,
  activeOfficers,
  operationManagers,
}: {
  total: number;
  activeOfficers: number;
  operationManagers: number;
}) {
  const values = [total, activeOfficers, operationManagers, 1];
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map(([title, caption, Icon, iconClass, trend], index) => (
        <article
          key={title}
          className="flex h-full flex-col gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-lg 2xl:p-6"
        >
          <div className="flex h-full items-start justify-between">
            <div className="flex flex-1 flex-col">
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {values[index]}
              </p>
              <p className="mt-1 text-sm text-slate-500">{caption}</p>
              <div className="mt-2 h-5">
                {trend && (
                  <p className="text-sm text-emerald-600">
                    {trend}{" "}
                    <span className="ml-2 text-slate-500">from last week</span>
                  </p>
                )}
              </div>
            </div>
            <span
              className={`grid size-12 place-items-center rounded-lg bg-blue-100 ${iconClass}`}
            >
              <Icon className="size-6" />
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}
