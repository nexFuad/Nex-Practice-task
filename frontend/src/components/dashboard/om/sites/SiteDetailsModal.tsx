"use client";
/* eslint-disable @next/next/no-img-element -- Site assignment profile URLs are externally hosted. */

import { CalendarDays, Clock3, Globe2, MapPin, Ruler, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAssignedSiteGuards, type AssignedSiteGuard } from "./sites.api";
import type { Site } from "./types";

export function SiteDetailsModal({
  site,
  onClose,
}: {
  site: Site;
  onClose: () => void;
}) {
  const active = site.status === "ACTIVE";
  const {
    data: guards = [],
    isLoading: loadingGuards,
    error: guardError,
  } = useQuery<AssignedSiteGuard[]>({
    queryKey: ["sites", site.id, "assigned-guards"],
    queryFn: () => getAssignedSiteGuards(site.id),
  });
  const guardMessage =
    guardError instanceof Error
      ? guardError.message
      : "Unable to load assigned guards.";
  return (
    <div className="fixed inset-0 z-70 grid place-items-center bg-slate-950/45 p-2 sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${site.name} details`}
        className="max-h-[calc(100vh-1rem)] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-4 text-sm shadow-2xl sm:max-h-[95vh] sm:rounded-2xl sm:p-7"
      >
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 sm:size-12">
                <MapPin className="size-5 text-slate-600 sm:size-6" />
              </span>
              <h2 className="wrap-break-word text-lg font-bold text-slate-950 sm:text-xl">
                {site.name}
              </h2>
            </div>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              Site Code: {site.code}
              <Status active={active} />
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="shrink-0 rounded-md border border-slate-300 p-1 text-slate-500 hover:bg-slate-50"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Card title="Site Information">
            <InfoGrid
              items={[
                ["Name", site.name],
                ["Code", site.code],
                ["Status", active ? "Active" : "Inactive"],
              ]}
              status={active}
            />
          </Card>
          <Card title="Location Details">
            <InfoGrid
              items={[
                ["Address", site.address],
                ["Latitude", site.latitude || "-"],
                ["Longitude", site.longitude || "-"],
              ]}
            />
          </Card>
          <Card title="Configuration">
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Value
                icon={<Globe2 />}
                label="Timezone"
                value="Asia/Singapore"
              />
              <Value icon={<Ruler />} label="Geofence" value="10000m" />
              <Value
                icon={<CalendarDays />}
                label="Created"
                value="29/05/2026"
              />
              <Value icon={<Clock3 />} label="Updated" value="28/08/2026" />
            </div>
          </Card>
          <Card
            title="Assigned Guards"
            badge={
              loadingGuards
                ? "Loading…"
                : guards.length
                  ? `${guards.length} ${guards.length === 1 ? "Guard" : "Guards"}`
                  : undefined
            }
          >
            {loadingGuards ? (
              <p className="py-5 text-center text-slate-500">
                Loading assigned guards…
              </p>
            ) : guardError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-red-700">
                {guardMessage}
              </p>
            ) : guards.length > 0 ? (
              <>
                <p className="mb-4 text-slate-500">
                  Guards with access to this site
                </p>
                <div className="max-h-60 space-y-3 overflow-y-auto pr-1 sm:pr-3">
                  {guards.map((guard) => (
                    <Guard key={guard.id} guard={guard} />
                  ))}
                </div>
              </>
            ) : null}
          </Card>
          <Card title="Recent Activity">
            <p className="mb-4 text-slate-500">
              Latest events and updates for this site
            </p>
            <div className="space-y-3">
              <Activity
                label="Site created"
                date="29/05/2026 09:33:12 AM"
                green
              />
              <Activity label="Last updated" date="28/08/2026 03:05:20 PM" />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Status({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "rounded-lg bg-emerald-100 px-3 py-1 text-xs text-emerald-700"
          : "rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-600"
      }
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
function Card({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-0 rounded-xl border border-slate-200 p-4 shadow-sm sm:min-h-44 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6">
        <h3 className="text-base font-semibold text-slate-950 sm:text-lg">
          {title}
        </h3>
        {badge && (
          <span className="rounded-lg border border-slate-200 px-2 py-0.5 text-xs">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
function InfoGrid({
  items,
  status,
}: {
  items: [string, string][];
  status?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label}>
          <p className="mb-1 text-slate-500 sm:mb-2">{label}:</p>
          {label === "Status" ? (
            <Status active={Boolean(status)} />
          ) : (
            <p className="wrap-break-word font-medium text-slate-900">{value}</p>
          )}
        </div>
      ))}
    </div>
  );
}
function Value({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-slate-500">
        <span className="size-4">{icon}</span>
        {label}
      </p>
      <p className="font-medium text-slate-900">{value}</p>
    </div>
  );
}
function Guard({ guard }: { guard: AssignedSiteGuard }) {
  const initials = guard.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const isOm = guard.role === "OM";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-600 font-medium text-white">
        {guard.profileImageUrl ? (
          <img
            src={guard.profileImageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          initials
        )}
      </span>
      <div className="min-w-0">
        <p className="wrap-break-word font-medium text-slate-900">
          {guard.fullName}{" "}
          <span
            className={
              isOm
                ? "ml-1 inline-block rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs text-purple-600"
                : "ml-1 inline-block rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
            }
          >
            {isOm ? "OM" : "OFFICER"}
          </span>
        </p>
        <p className="truncate text-slate-500">ID: {guard.employeeId}</p>
      </div>
    </div>
  );
}
function Activity({
  label,
  date,
  green = false,
}: {
  label: string;
  date: string;
  green?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="flex items-center gap-3 font-medium">
        <span
          className={`size-2.5 rounded-full ${green ? "bg-emerald-500" : "bg-blue-500"}`}
        />
        {label}
      </p>
      <p className="ml-5 mt-1 text-xs text-slate-500">{date}</p>
    </div>
  );
}
