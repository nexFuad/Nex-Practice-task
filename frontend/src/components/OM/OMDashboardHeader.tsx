import type { OMDashboardHeaderProps } from "@/Types/componentTypes";

export function OMDashboardHeader({
  title,
  description,
  children,
}: OMDashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </header>
  );
}
