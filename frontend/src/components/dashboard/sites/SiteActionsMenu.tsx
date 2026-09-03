import { Building2, Eye, PowerOff, SquarePen, Trash2 } from "lucide-react";
import type { Site } from "./types";

type Props = {
  site: Site;
  onView: () => void;
  onEdit: () => void;
  onManageClients: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  floating?: boolean;
  position?: { top: number; right: number };
};

export function SiteActionsMenu({
  site,
  onView,
  onEdit,
  onManageClients,
  onToggleStatus,
  onDelete,
  floating = false,
  position,
}: Props) {
  return (
    <div
      role="menu"
      aria-label="Site actions"
      style={position}
      className={`${floating ? "fixed" : "absolute right-0 top-9"} z-[60] w-64 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl sm:w-44`}
    >
      <p className="px-3 py-2 text-sm font-medium text-slate-900">Actions</p>
      <Action onClick={onView} icon={<Eye />}>
        View Details
      </Action>
      <Action onClick={onEdit} icon={<SquarePen />}>
        Edit Site
      </Action>
      <Action onClick={onManageClients} icon={<Building2 />}>
        Manage Clients
      </Action>
      <div role="separator" className="-mx-1.5 my-1.5 h-px bg-slate-200" />
      <Action onClick={onToggleStatus} icon={<PowerOff />}>
        {site.status === "ACTIVE" ? "Deactivate" : "Activate"}
      </Action>
      <Action onClick={onDelete} icon={<Trash2 />} destructive>
        Delete
      </Action>
    </div>
  );
}

function Action({
  children,
  icon,
  onClick,
  destructive = false,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      role="menuitem"
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium outline-none transition sm:py-2 sm:text-xs ${destructive ? "text-red-600 hover:bg-red-50" : "text-slate-800 hover:bg-slate-50"}`}
    >
      <span
        className={`flex size-4 shrink-0 items-center justify-center [&>svg]:size-5 ${destructive ? "text-red-500" : "text-slate-500"}`}
      >
        {icon}
      </span>
      {children}
    </button>
  );
}
