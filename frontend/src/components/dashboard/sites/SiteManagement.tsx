"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";
import { ManageSiteClientsModal } from "./ManageSiteClientsModal";
import { SiteDetailsModal } from "./SiteDetailsModal";
import { SiteFormModal } from "./SiteFormModal";
import { SiteStats } from "./SiteStats";
import { SitesTable } from "./SitesTable";
import { Toast } from "./Toast";
import { createSite, deleteSite, getSites, updateSite, updateSiteStatus, type SitePayload } from "./sites.api";
import type { Site } from "./types";

const asNumberOrNull = (value: FormDataEntryValue | null) => { if (typeof value !== "string" || value.trim() === "") return null; const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };

export function SiteManagement() {
  const [sites, setSites] = useState<Site[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [formSite, setFormSite] = useState<Site | "new" | null>(null);
  const [detailsSite, setDetailsSite] = useState<Site | null>(null);
  const [clientSite, setClientSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { let active = true; getSites().then((loaded) => { if (active) setSites(loaded); }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load sites."); }).finally(() => { if (active) setIsLoading(false); }); return () => { active = false; }; }, []);

  const visibleSites = useMemo(() => sites.filter((site) => (status === "ALL" || site.status === status) && `${site.name}${site.code}${site.address}`.toLowerCase().includes(query.toLowerCase())), [query, sites, status]);
  const metrics = [sites.length, sites.filter((site) => site.status === "ACTIVE").length, sites.filter((site) => site.status === "INACTIVE").length, sites.filter((site) => site.assignedGuards > 0).length];
  const saveSite = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const payload: SitePayload = { name: String(form.get("name")), code: String(form.get("code")).toUpperCase(), address: String(form.get("address")), latitude: asNumberOrNull(form.get("latitude")), longitude: asNumberOrNull(form.get("longitude")), status: String(form.get("status")) as Site["status"] }; try { setError(null); const saved = formSite === "new" ? await createSite(payload) : await updateSite(formSite!.id, payload); setSites((current) => formSite === "new" ? [...current, saved] : current.map((site) => site.id === saved.id ? saved : site)); setFormSite(null); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save site."); } };
  const toggleStatus = async (selected: Site) => { try { setError(null); const saved = await updateSiteStatus(selected.id, selected.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"); setSites((current) => current.map((site) => site.id === saved.id ? saved : site)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update site status."); } finally { setOpenMenuId(null); } };
  const removeSite = async (selected: Site) => { try { setError(null); await deleteSite(selected.id); setSites((current) => current.filter((site) => site.id !== selected.id)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete site."); } finally { setOpenMenuId(null); } };
  const exportCsv = () => { const csv = visibleSites.map((site) => `${site.name},${site.code},${site.address},${site.status}`).join("\n"); const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = "sites.csv"; link.click(); URL.revokeObjectURL(link.href); };
  const saveClients = (saved: Site, selectedCount: number) => { setSites((current) => current.map((site) => site.id === saved.id ? saved : site)); setClientSite(null); setToast(selectedCount ? "Site clients updated successfully" : "All clients removed from site"); };

  return <section onClick={() => setOpenMenuId(null)} className="p-5 text-slate-800 sm:p-7 lg:p-8">{toast && <Toast message={toast} onClose={() => setToast(null)} />}<header className="flex items-start justify-between gap-4"><div><h1 className="text-2xl font-bold">Site Management</h1><p className="mt-1 text-base text-slate-500">Manage security sites and locations</p></div><button type="button" onClick={() => setFormSite("new")} className="inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm text-white"><Plus className="size-4" />Add Site</button></header><SiteStats values={metrics} /><section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold">All Sites</h2><p className="mt-1 text-sm text-slate-500">Manage site locations and assignments</p>{error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<div className="mt-6 flex gap-3"><label className="relative flex-1"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sites..." className="h-12 w-full rounded-xl border border-slate-200 pl-11 text-sm" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-4 text-sm"><option value="ALL">All Status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select><button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 text-sm"><Download className="size-5" />Export</button></div>{isLoading ? <p className="py-10 text-center text-sm text-slate-500">Loading sites...</p> : <SitesTable sites={visibleSites} openMenuId={openMenuId} onToggleMenu={(id) => setOpenMenuId((current) => current === id ? null : id)} onView={(site) => { setDetailsSite(site); setOpenMenuId(null); }} onEdit={(site) => { setFormSite(site); setOpenMenuId(null); }} onManageClients={(site) => { setClientSite(site); setOpenMenuId(null); }} onToggleStatus={toggleStatus} onDelete={removeSite} />}</section>{formSite && <SiteFormModal site={formSite} onClose={() => setFormSite(null)} onSubmit={saveSite} />}{detailsSite && <SiteDetailsModal site={detailsSite} onClose={() => setDetailsSite(null)} />}{clientSite && <ManageSiteClientsModal site={clientSite} onClose={() => setClientSite(null)} onSaved={saveClients} />}</section>;
}
