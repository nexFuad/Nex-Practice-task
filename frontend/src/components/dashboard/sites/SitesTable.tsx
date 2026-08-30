import { EllipsisVertical, MapPin } from "lucide-react";
import { SiteActionsMenu } from "./SiteActionsMenu";
import type { Site } from "./types";

type Props = {
  sites: Site[];
  openMenuId: string | null;
  onToggleMenu: (id: string) => void;
  onView: (site: Site) => void;
  onEdit: (site: Site) => void;
  onManageClients: (site: Site) => void;
  onToggleStatus: (site: Site) => void;
  onDelete: (site: Site) => void;
};

export function SitesTable({
  sites,
  openMenuId,
  onToggleMenu,
  onView,
  onEdit,
  onManageClients,
  onToggleStatus,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead className="border-b border-slate-200">
          <tr>
            {[
              "Site Name",
              "Site Code",
              "Address",
              "Client",
              "Assigned Guards",
              "Status",
              "Actions",
            ].map((heading) => (
              <th key={heading} className={`h-10 px-2 font-medium whitespace-nowrap ${heading === "Actions" ? "text-right" : "text-left"}`}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr
              key={site.id}
              className="border-b border-slate-200 transition-colors hover:bg-slate-50 last:border-0"
            >
              <td className="p-2 font-medium whitespace-nowrap">
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 text-slate-400" />
                  {site.name}
                </span>
              </td>
              <td className="p-2 whitespace-nowrap">{site.code}</td>
              <td className="max-w-[200px] truncate p-2 whitespace-nowrap">{site.address}</td>
              <td className="max-w-48 truncate p-2 whitespace-nowrap">
                {site.clients?.length
                  ? site.clients.map((client) => client.name).join(", ")
                  : "-"}
              </td>
              <td className="p-2 whitespace-nowrap">{site.assignedGuards}</td>
              <td className="p-2 whitespace-nowrap">
                <span
                  className={
                    site.status === "ACTIVE"
                      ? "rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                      : "rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                  }
                >
                  {site.status === "ACTIVE" ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="relative p-2 text-right">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleMenu(site.id);
                  }}
                  className="inline-grid size-8 place-items-center rounded-md hover:bg-slate-100"
                >
                  <EllipsisVertical className="size-4" />
                </button>
                {openMenuId === site.id && (
                  <div onClick={(event) => event.stopPropagation()}>
                    <SiteActionsMenu
                      site={site}
                      onView={() => onView(site)}
                      onEdit={() => onEdit(site)}
                      onManageClients={() => onManageClients(site)}
                      onToggleStatus={() => onToggleStatus(site)}
                      onDelete={() => onDelete(site)}
                    />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
