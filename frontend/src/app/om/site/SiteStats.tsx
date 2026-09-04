import { Building2, Power, PowerOff, Users } from "lucide-react";

export function SiteStats({ values }: { values: number[] }) {
  const stats = [
    ["Total Sites", Building2, "text-slate-500"],
    ["Active Sites", Power, "text-green-600"],
    ["Inactive Sites", PowerOff, "text-red-600"],
    ["Sites with Guards", Users, "text-blue-600"],
  ] as const;

  return (
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(([label, Icon, color], index) => (
        <div
          key={label}
          className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white py-6 shadow-sm"
        >
          <div className="flex items-center justify-between px-6 pb-2 text-sm font-medium">
            <span>{label}</span>
            <Icon className={`size-4 ${color}`} />
          </div>
          <div className="px-6">
            <p className="text-2xl font-bold">{values[index]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
