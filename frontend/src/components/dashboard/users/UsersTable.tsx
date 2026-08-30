import { Mail, MapPin, Phone, UserRoundCheck } from "lucide-react";
import type { DemoUser } from "./types";
import { UserActionsMenu } from "./UserActionsMenu";

export function UsersTable({
  users,
  openMenuId,
  onToggleMenu,
  onCloseMenu,
}: {
  users: DemoUser[];
  openMenuId: string | null;
  onToggleMenu: (id: string) => void;
  onCloseMenu: () => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full text-sm">
        <thead className="border-b border-slate-200 text-left text-slate-900">
          <tr>
            <th className="h-10 px-2 font-medium whitespace-nowrap">User ↕</th>
            <th className="h-10 px-2 font-medium whitespace-nowrap">Contact</th>
            <th className="h-10 px-2 font-medium whitespace-nowrap">Role ↕</th>
            <th className="h-10 px-2 font-medium whitespace-nowrap">Assigned Site</th>
            <th className="h-10 px-2 font-medium whitespace-nowrap">Status ↕</th>
            <th className="h-10 px-2 text-right font-medium whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-slate-200 transition-colors hover:bg-slate-50 last:border-b-0"
            >
              <td className="p-2 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-100 text-sm text-blue-700">
                    {user.name[0]}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">ID: {user.id}</p>
                  </div>
                </div>
              </td>
              <td className="space-y-1 p-2 text-sm text-slate-600 whitespace-nowrap">
                <p className="flex items-center gap-2">
                  <Mail className="size-3" />
                  {user.email || "-"}
                </p>
                <p className="mt-1 flex items-center gap-2">
                  <Phone className="size-3" />
                  {user.phone}
                </p>
              </td>
              <td className="p-2 whitespace-nowrap">
                <span
                  className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${user.role === "OM" ? "border-purple-200 bg-purple-100 text-purple-700" : "border-blue-200 bg-blue-100 text-blue-700"}`}
                >
                  {user.role === "OM" ? "OM" : "OFFICER"}
                </span>
              </td>
              <td className="p-2 text-sm text-slate-600 whitespace-nowrap">
                <span className="flex items-center gap-2">
                  <MapPin className="size-3 shrink-0" />
                  {user.assignedSite
                    ? `${user.assignedSite}${user.additionalSites ? " (+1 more)" : ""}`
                    : "Unassigned"}
                </span>
              </td>
              <td className="p-2 whitespace-nowrap">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${user.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
                >
                  <UserRoundCheck className="size-3" />
                  {user.status}
                </span>
              </td>
              <td className="p-2 text-right">
                <UserActionsMenu
                  open={openMenuId === user.id}
                  onToggle={() => onToggleMenu(user.id)}
                  onClose={onCloseMenu}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <p className="py-12 text-center text-sm text-slate-500">
          No users found.
        </p>
      )}
    </div>
  );
}

export function UsersTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-[1.6fr_1.4fr_0.8fr_1.5fr_0.8fr_0.4fr] gap-5 border-b border-slate-200 px-3 py-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-4 rounded bg-slate-100" />
        ))}
      </div>
      {Array.from({ length: 7 }).map((_, row) => (
        <div
          key={row}
          className="grid grid-cols-[1.6fr_1.4fr_0.8fr_1.5fr_0.8fr_0.4fr] gap-5 border-b border-slate-100 px-3 py-5"
        >
          {Array.from({ length: 6 }).map((__, index) => (
            <div key={index} className="h-5 rounded bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  );
}
