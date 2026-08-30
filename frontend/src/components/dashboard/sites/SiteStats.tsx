import { Building2, Power, Users } from "lucide-react";

export function SiteStats({ values }: { values: number[] }) {
  const stats = [
    ["Total Sites", Building2],
    ["Active Sites", Power],
    ["Inactive Sites", Power],
    ["Sites with Guards", Users],
  ] as const;

  return (
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(([label, Icon], index) => (
        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between text-sm"><span>{label}</span><Icon className="size-5 text-blue-600" /></div>
          <p className="mt-8 text-3xl font-bold">{values[index]}</p>
        </div>
      ))}
    </div>
  );
}
