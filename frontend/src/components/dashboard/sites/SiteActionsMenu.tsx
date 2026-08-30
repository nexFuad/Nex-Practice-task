import { Building2, Eye, Pencil, PowerOff, Trash2 } from "lucide-react";
import type { Site } from "./types";

type Props = {
  site: Site;
  onView: () => void;
  onEdit: () => void;
  onManageClients: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
};

export function SiteActionsMenu({ site, onView, onEdit, onManageClients, onToggleStatus, onDelete }: Props) {
  return (
    <div className="absolute right-3 top-7 z-30 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
      <p className="px-3 py-2 text-sm font-semibold">Actions</p>
      <Action onClick={onView} icon={<Eye />}>View Details</Action>
      <Action onClick={onEdit} icon={<Pencil />}>Edit Site</Action>
      <Action onClick={onManageClients} icon={<Building2 />}>Manage Clients</Action>
      <div className="my-1 border-t border-slate-200" />
      <Action onClick={onToggleStatus} icon={<PowerOff />}>{site.status === "ACTIVE" ? "Deactivate" : "Activate"}</Action>
      <Action onClick={onDelete} icon={<Trash2 />} destructive>Delete</Action>
    </div>
  );
}

function Action({ children, icon, onClick, destructive = false }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void; destructive?: boolean }) {
  return <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left hover:bg-slate-50 ${destructive ? "text-red-600 hover:bg-red-50" : ""}`}><span className="size-5 text-slate-500">{icon}</span>{children}</button>;
}
