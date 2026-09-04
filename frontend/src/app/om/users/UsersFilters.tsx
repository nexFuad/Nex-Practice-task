import { LoaderCircle, Search } from "lucide-react";

export function UsersFilters({
  query,
  role,
  status,
  roles,
  statuses,
  optionsLoading,
  onQueryChange,
  onRoleChange,
  onStatusChange,
}: {
  query: string;
  role: string;
  status: string;
  roles: string[];
  statuses: string[];
  optionsLoading: boolean;
  onQueryChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search users by name, or ID..."
            className="h-10 w-full rounded-md border border-slate-200 bg-white py-1 pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <div className="grid grid-cols-2 gap-3 sm:contents">
          <select
            value={role}
            disabled={optionsLoading}
            onChange={(event) => onRoleChange(event.target.value)}
            className="h-10 min-w-0 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none disabled:cursor-wait disabled:bg-slate-50 sm:w-37.5"
          >
            <option value="ALL">
              {optionsLoading ? "Loading roles…" : "All Roles"}
            </option>
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={status}
            disabled={optionsLoading}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-10 min-w-0 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none disabled:cursor-wait disabled:bg-slate-50 sm:w-37.5"
          >
            <option value="ALL">
              {optionsLoading ? "Loading status…" : "All Status"}
            </option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          {optionsLoading && (
            <LoaderCircle
              className="size-4 animate-spin self-center text-slate-400"
              aria-label="Loading filter options"
            />
          )}
        </div>
      </div>
    </section>
  );
}
