"use client";

import { FormEvent, useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Plus, Search } from "lucide-react";
import { ManageSiteClientsModal } from "./ManageSiteClientsModal";
import { SiteDetailsModal } from "./SiteDetailsModal";
import { SiteFormModal } from "./SiteFormModal";
import { SiteStats } from "./SiteStats";
import { SitesTable } from "./SitesTable";
import { Toast } from "./Toast";
import { UsersPagination } from "../users/UsersPagination";
import { TableSkeleton } from "../TableSkeleton";
import {
  createSite,
  deleteSite,
  getSites,
  updateSite,
  updateSiteStatus,
  type PaginatedSites,
  type SitePayload,
} from "./sites.api";
import type { Site } from "./types";

const asNumberOrNull = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function SiteManagement() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [formSite, setFormSite] = useState<Site | "new" | null>(null);
  const [detailsSite, setDetailsSite] = useState<Site | null>(null);
  const [clientSite, setClientSite] = useState<Site | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();
  const deferredQuery = useDeferredValue(query);
  const {
    data,
    isLoading,
    error: sitesError,
  } = useQuery<PaginatedSites>({
    queryKey: ["sites", { query: deferredQuery, status, page, pageSize: 10 }],
    queryFn: () =>
      getSites({
        query: deferredQuery,
        status: status as Site["status"] | "ALL",
        page,
        pageSize: 10,
      }),
    placeholderData: (previous) => previous,
  });
  const invalidateSites = () => {
    void queryClient.invalidateQueries({ queryKey: ["sites"] });
    void queryClient.invalidateQueries({ queryKey: ["site-options"] });
  };
  const saveMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | null;
      payload: SitePayload;
    }) => (id ? updateSite(id, payload) : createSite(payload)),
    onSuccess: invalidateSites,
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Site["status"] }) =>
      updateSiteStatus(id, status),
    onSuccess: invalidateSites,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSite,
    onSuccess: invalidateSites,
  });

  const sites = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 10));
  const currentPage = Math.min(page, totalPages);
  const metrics = [
    data?.stats.total ?? 0,
    data?.stats.active ?? 0,
    data?.stats.inactive ?? 0,
    data?.stats.withGuards ?? 0,
  ];
  const saveSite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload: SitePayload = {
      name: String(form.get("name")),
      code: String(form.get("code")).toUpperCase(),
      address: String(form.get("address")),
      latitude: asNumberOrNull(form.get("latitude")),
      longitude: asNumberOrNull(form.get("longitude")),
      status: String(form.get("status")) as Site["status"],
    };
    try {
      setError(null);
      await saveMutation.mutateAsync({
        id: formSite === "new" ? null : (formSite?.id ?? null),
        payload,
      });
      setFormSite(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save site.");
    }
  };
  const toggleStatus = async (selected: Site) => {
    try {
      setError(null);
      await statusMutation.mutateAsync({
        id: selected.id,
        status: selected.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to update site status.",
      );
    } finally {
      setOpenMenuId(null);
    }
  };
  const removeSite = async (selected: Site) => {
    try {
      setError(null);
      await deleteMutation.mutateAsync(selected.id);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to delete site.",
      );
    } finally {
      setOpenMenuId(null);
    }
  };
  const exportCsv = () => {
    const csv = sites
      .map((site) => `${site.name},${site.code},${site.address},${site.status}`)
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "sites-page.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const saveClients = (_saved: Site, selectedCount: number) => {
    void queryClient.invalidateQueries({ queryKey: ["sites"] });
    setClientSite(null);
    setToast(
      selectedCount
        ? "Site clients updated successfully"
        : "All clients removed from site",
    );
  };

  return (
    <section
      onClick={() => setOpenMenuId(null)}
      className="min-w-0 px-4 pb-5 pt-4 text-slate-800 sm:px-5"
    >
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Site Management
            </h1>
            <p className="text-sm text-slate-500">
              Manage security sites and locations
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormSite("new")}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 sm:h-9"
          >
            <Plus className="size-4" />
            Add Site
          </button>
        </header>
        <SiteStats values={metrics} />
        <section className="flex min-h-160 flex-col gap-4 rounded-xl border border-slate-200 bg-white py-5 shadow-sm sm:py-6">
          <header className="px-4 sm:px-6">
            <h2 className="font-semibold">All Sites</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage site locations and assignments
            </p>
          </header>
          <div className="flex flex-1 flex-col space-y-4 px-4 sm:px-6">
            {(error || sitesError) && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error ||
                  (sitesError instanceof Error
                    ? sitesError.message
                    : "Unable to load sites.")}
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <label className="relative min-w-0 flex-1">
                <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search sites..."
                  className="h-10 w-full rounded-md border border-slate-200 bg-white py-1 pl-8 pr-3 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:h-9"
                />
              </label>
              <div className="grid grid-cols-2 gap-3 sm:contents">
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                  className="h-10 min-w-0 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-blue-400 sm:h-9 sm:w-45"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <button
                  type="button"
                  onClick={exportCsv}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium shadow-sm hover:bg-slate-50 sm:h-9"
                >
                  <Download className="size-4" />
                  Export
                </button>
              </div>
            </div>
            {isLoading ? (
              <TableSkeleton columns={7} className="min-h-115" />
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="flex-1">
                  <SitesTable
                    sites={sites}
                    openMenuId={openMenuId}
                    onToggleMenu={(id) =>
                      setOpenMenuId((current) => (current === id ? null : id))
                    }
                    onCloseMenu={() => setOpenMenuId(null)}
                    onView={(site) => {
                      setDetailsSite(site);
                      setOpenMenuId(null);
                    }}
                    onEdit={(site) => {
                      setFormSite(site);
                      setOpenMenuId(null);
                    }}
                    onManageClients={(site) => {
                      setClientSite(site);
                      setOpenMenuId(null);
                    }}
                    onToggleStatus={toggleStatus}
                    onDelete={removeSite}
                  />
                </div>
                <UsersPagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </section>
      </div>
      {formSite && (
        <SiteFormModal
          site={formSite}
          onClose={() => setFormSite(null)}
          onSubmit={saveSite}
        />
      )}
      {detailsSite && (
        <SiteDetailsModal
          site={detailsSite}
          onClose={() => setDetailsSite(null)}
        />
      )}
      {clientSite && (
        <ManageSiteClientsModal
          site={clientSite}
          onClose={() => setClientSite(null)}
          onSaved={saveClients}
        />
      )}
    </section>
  );
}
