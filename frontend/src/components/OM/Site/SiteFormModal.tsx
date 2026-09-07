"use client";

import { FormEvent, useState } from "react";
import { MapPin, X } from "lucide-react";
import type { Site } from "@/Types/siteTypes";

export function SiteFormModal({
  site,
  onClose,
  onSubmit,
}: {
  site: Site | "new";
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const isNew = site === "new";
  const [latitude, setLatitude] = useState(isNew ? "" : (site.latitude ?? ""));
  const [longitude, setLongitude] = useState(
    isNew ? "" : (site.longitude ?? ""),
  );
  const [geofence, setGeofence] = useState(100);
  const locate = () =>
    navigator.geolocation?.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude.toFixed(6));
      setLongitude(position.coords.longitude.toFixed(6));
    });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <form
        onSubmit={onSubmit}
        className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 text-sm shadow-2xl"
      >
        <header className="flex justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {isNew ? "Create New Site" : "Edit Site"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isNew
                ? "Add a new security site location"
                : "Update site information and settings"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tenant: Elid Technology System Team
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </button>
        </header>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Site Name">
            <input
              required
              name="name"
              defaultValue={isNew ? "" : site.name}
              placeholder="Main Office Building"
            />
          </Field>
          <Field label="Site Code">
            <input
              required
              name="code"
              defaultValue={isNew ? "" : site.code}
              placeholder="SITE001"
            />
          </Field>
          <Field label="Address" wide>
            <textarea
              required
              name="address"
              defaultValue={isNew ? "" : site.address}
              placeholder="1 Raffles Place, Singapore 048616"
            />
          </Field>
          <p className="font-semibold sm:col-span-2">Coordinates</p>
          <Field label="Latitude">
            <input
              required
              name="latitude"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
            />
          </Field>
          <Field label="Longitude">
            <input
              required
              name="longitude"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
            />
          </Field>
          <button
            type="button"
            onClick={locate}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            <MapPin className="size-4" />
            Use Current Location
          </button>
          <label className="sm:col-span-2">
            Geofence Radius: {geofence}m
            <input
              type="range"
              min="50"
              max="10000"
              step="50"
              value={geofence}
              onChange={(event) => setGeofence(Number(event.target.value))}
              className="mt-2 w-full accent-neutral-900"
            />
            <span className="block text-xs text-slate-500">
              Guards must check in within this radius
            </span>
          </label>
          <Field label="Timezone">
            <select>
              <option>Singapore</option>
            </select>
          </Field>
          <select
            name="status"
            defaultValue={isNew ? "ACTIVE" : site.status}
            className="hidden"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <footer className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-4 py-2"
          >
            Cancel
          </button>
          <button className="rounded-md bg-neutral-900 px-4 py-2 text-white">
            {isNew ? "Create Site" : "Update Site"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function Field({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`space-y-1 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="font-medium">{label}</span>
      <span className="block [&_input]:h-9 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-slate-200 [&_input]:px-3 [&_select]:h-9 [&_select]:w-full [&_select]:rounded-md [&_select]:border [&_select]:border-slate-200 [&_select]:px-3 [&_textarea]:min-h-16 [&_textarea]:w-full [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:p-3">
        {children}
      </span>
    </label>
  );
}
