"use client";

import { ChevronDown, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteOption } from "./types";

export function DeploymentAssignment({
  sites,
  selectedSiteId,
  onDeploymentChange,
}: {
  sites: SiteOption[];
  selectedSiteId: string;
  onDeploymentChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const visibleSites = useMemo(
    () =>
      sites
        .filter((site) => site.name.toLowerCase().includes(query.toLowerCase()))
        .sort(
          (a, b) =>
            Number(b.name.toLowerCase().startsWith(query.toLowerCase())) -
            Number(a.name.toLowerCase().startsWith(query.toLowerCase())),
        ),
    [query, sites],
  );
  const selectedSite = sites.find((site) => site.id === selectedSiteId);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold">Deployment Assignment</h2>
      <div ref={pickerRef} className="relative mt-4 max-w-xl">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-left text-sm"
        >
          <span className={selectedSite ? "text-slate-800" : "text-slate-400"}>
            {selectedSite?.name ?? "Select deployment site"}
          </span>
          <ChevronDown className="size-4 text-slate-400" />
        </button>
        {open && (
          <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white p-2 shadow-lg">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search sites..."
                className="h-8 w-full rounded-md border border-slate-200 pl-9 pr-2 text-xs outline-none"
              />
            </label>
            <div className="mt-2 max-h-44 overflow-y-auto">
              {visibleSites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => {
                    onDeploymentChange(site.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <MapPin className="size-3.5 text-slate-400" />
                  {site.name}
                </button>
              ))}
              {visibleSites.length === 0 && (
                <p className="px-2 py-3 text-xs text-slate-500">
                  No sites found.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function SiteAssignments({
  sites,
  selectedSiteIds,
  onToggleSite,
}: {
  sites: SiteOption[];
  selectedSiteIds: string[];
  onToggleSite: (id: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <MapPin className="size-4" />
        <h2 className="text-sm font-semibold">Site Assignments</h2>
      </div>
      <div className="mt-4 space-y-3 rounded-xl border border-slate-200 p-4">
        {sites.length ? (
          sites.map((site) => (
            <label
              key={site.id}
              className="flex cursor-pointer items-center gap-3 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={selectedSiteIds.includes(site.id)}
                onChange={() => onToggleSite(site.id)}
                className="size-4 rounded border-slate-300"
              />
              {site.name}
            </label>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            No sites available. Create a site first.
          </p>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {selectedSiteIds.length} sites selected
      </p>
    </section>
  );
}
