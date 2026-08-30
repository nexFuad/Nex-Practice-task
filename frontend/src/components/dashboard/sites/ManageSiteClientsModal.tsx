"use client";

import { FormEvent, useEffect, useState } from "react";
import { MapPin, Search, Users, X } from "lucide-react";
import { searchClients } from "./clients.api";
import { getSiteClients, saveSiteClients } from "./sites.api";
import type { Client, Site } from "./types";

export function ManageSiteClientsModal({ site, onClose, onSaved }: { site: Site; onClose: () => void; onSaved: (site: Site, selectedCount: number) => void }) {
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentCount, setCurrentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSiteClients(site.id).then((assigned) => { if (active) { setSelectedIds(new Set(assigned.map((client) => client.id))); setCurrentCount(assigned.length); } }).catch(() => { if (active) setError("Unable to load assigned clients."); }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [site.id]);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => { searchClients(query).then((items) => { if (active) setClients(items); }).catch(() => { if (active) setError("Unable to search clients."); }); }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [query]);

  const toggleClient = (clientId: string) => setSelectedIds((current) => {
    const next = new Set(current);
    if (next.has(clientId)) next.delete(clientId);
    else next.add(clientId);
    return next;
  });
  const save = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); try { setIsSaving(true); setError(null); const saved = await saveSiteClients(site.id, [...selectedIds]); onSaved(saved, selectedIds.size); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save clients."); } finally { setIsSaving(false); } };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"><form onSubmit={save} className="w-full max-w-2xl rounded-2xl bg-white p-5 text-sm shadow-2xl sm:p-6"><header className="flex items-start justify-between"><div><h2 className="text-lg font-semibold text-slate-950">Manage Site Clients</h2><p className="mt-1 text-sm text-slate-500">Add or remove clients who manage this site. Select multiple clients as needed.</p></div><button type="button" onClick={onClose} aria-label="Close"><X className="size-5 text-slate-500" /></button></header><div className="mt-5 rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-2 font-medium"><MapPin className="size-5 text-slate-500" />{site.name}<span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs">{site.code}</span></div><p className="mt-3 flex items-center gap-2 text-slate-500"><Users className="size-4" />Currently: {currentCount} clients → Selected: {selectedIds.size} clients</p></div>{error && <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}<label className="relative mt-4 block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search clients..." className="h-10 w-full rounded-md border border-slate-300 pl-10 pr-3 outline-none focus:border-slate-500" /></label><p className="mt-4 font-semibold">Select Clients</p><div className="mt-3 max-h-56 overflow-y-auto pr-1">{isLoading ? <p className="py-8 text-center text-slate-500">Loading clients...</p> : clients.length ? <div className="space-y-2">{clients.map((client) => <label key={client.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"><input type="checkbox" checked={selectedIds.has(client.id)} onChange={() => toggleClient(client.id)} className="size-4 accent-slate-900" /><span><span className="block font-medium">{client.name}</span><span className="text-xs text-slate-500">{client.email}</span></span></label>)}</div> : <p className="py-10 text-center text-slate-500">No clients available. Create clients first.</p>}</div><footer className="mt-5 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2">Cancel</button><button disabled={isSaving} className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-60">{isSaving ? "Saving..." : "Save Changes"}</button></footer></form></div>;
}
