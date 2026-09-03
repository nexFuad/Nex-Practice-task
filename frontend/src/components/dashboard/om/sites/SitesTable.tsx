import { EllipsisVertical, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  onCloseMenu: () => void;
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
  onCloseMenu,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const close = (event: PointerEvent) => {
      if (
        menuRef.current?.contains(event.target as Node) ||
        triggerRef.current?.contains(event.target as Node)
      )
        return;
      onCloseMenu();
    };
    const closeOnViewportChange = () => onCloseMenu();
    document.addEventListener("pointerdown", close);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [onCloseMenu, openMenuId]);

  const openMenu = (siteId: string, button: HTMLButtonElement) => {
    const rect = button.getBoundingClientRect();
    const estimatedMenuHeight = 280;
    const openAbove =
      rect.bottom + estimatedMenuHeight > window.innerHeight - 12;
    setMenuPosition({
      top: openAbove
        ? Math.max(12, rect.top - estimatedMenuHeight)
        : rect.bottom + 8,
      right: Math.max(12, window.innerWidth - rect.right),
    });
    onToggleMenu(siteId);
  };
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full min-w-220 text-left text-sm">
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
              <th
                key={heading}
                className={`h-10 px-2 font-medium whitespace-nowrap ${heading === "Actions" ? "text-right" : "text-left"}`}
              >
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
              <td className="max-w-50 truncate p-2 whitespace-nowrap">
                {site.address}
              </td>
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
                  ref={openMenuId === site.id ? triggerRef : undefined}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openMenu(site.id, event.currentTarget);
                  }}
                  className="inline-grid size-8 place-items-center rounded-md hover:bg-slate-100"
                >
                  <EllipsisVertical className="size-4" />
                </button>
                {openMenuId === site.id &&
                  menuPosition &&
                  typeof document !== "undefined" &&
                  createPortal(
                    <div
                      ref={menuRef}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <SiteActionsMenu
                        site={site}
                        onView={() => onView(site)}
                        onEdit={() => onEdit(site)}
                        onManageClients={() => onManageClients(site)}
                        onToggleStatus={() => onToggleStatus(site)}
                        onDelete={() => onDelete(site)}
                        floating
                        position={menuPosition}
                      />
                    </div>,
                    document.body,
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
