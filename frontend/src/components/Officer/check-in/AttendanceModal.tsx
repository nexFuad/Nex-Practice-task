"use client";
/* eslint-disable @next/next/no-img-element -- The preview uses a newly captured camera image URL. */

import { Camera, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { checkIn, checkOut, type OfficerRecord, type OfficerShift, type OfficerSite } from "@/Services/officerAttendance";
import { haversine, position } from "@/lib/officerAttendanceUtils";
import type { Position } from "@/Types/officerAttendanceTypes";
import { SearchSelect } from "./SearchSelect";
import { LiveCamera } from "./LiveCamera";

export function AttendanceModal({
  mode,
  sites,
  shifts,
  active,
  onClose,
  onSaved,
}: {
  mode: "in" | "out";
  sites: OfficerSite[];
  shifts: OfficerShift[];
  active: OfficerRecord | null;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
}) {
  const [siteId, setSiteId] = useState(active?.siteId ?? "");
  const [shiftId, setShiftId] = useState(active?.shiftId ?? "");
  const [siteQuery, setSiteQuery] = useState("");
  const [shiftQuery, setShiftQuery] = useState("");
  const [location, setLocation] = useState<Position | null>(null);
  const [locationMessage, setLocationMessage] = useState(
    "Getting current GPS location…",
  );
  const [photo, setPhoto] = useState<string | null>(null);
  const [camera, setCamera] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const site = sites.find((item) => item.id === siteId);
  const distance = location && site ? haversine(location, site) : null;
  const inside =
    distance !== null && site ? distance <= site.geofenceRadius : false;
  useEffect(() => {
    let activeRequest = true;
    void position()
      .then((value) => {
        if (activeRequest) {
          setLocation(value);
          setLocationMessage("Current location captured.");
        }
      })
      .catch((cause: Error) => {
        if (activeRequest) setLocationMessage(cause.message);
      });
    return () => {
      activeRequest = false;
    };
  }, []);
  const filteredSites = sites.filter((item) =>
    `${item.name} ${item.code}`.toLowerCase().includes(siteQuery.toLowerCase()),
  );
  const filteredShifts = shifts.filter(
    (item) =>
      `${item.name} ${item.code}`
        .toLowerCase()
        .includes(shiftQuery.toLowerCase()) &&
      (!item.siteId || item.siteId === siteId),
  );
  const valid = Boolean(
    siteId && shiftId && photo && location && inside && !saving,
  );
  const submit = async () => {
    if (!valid || !location) return;
    setSaving(true);
    setError("");
    try {
      const payload = { siteId, shiftId, photoUrl: photo, ...location };
      if (mode === "in") await checkIn(payload);
      else await checkOut(payload);
      await onSaved(
        mode === "in"
          ? "Checked in successfully."
          : "Checked out successfully.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save attendance.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-60 grid place-items-center bg-slate-950/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold">
              {mode === "in" ? "Check In" : "Check Out"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Use a current camera photo and your live device location.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {mode === "in" ? (
            <>
              <SearchSelect
                label="Site"
                placeholder="Search site name or code"
                value={siteId}
                query={siteQuery}
                setQuery={setSiteQuery}
                options={filteredSites.map((item) => ({
                  id: item.id,
                  label: `${item.name} (${item.code})`,
                }))}
                onChange={setSiteId}
              />
              <SearchSelect
                label="Shift"
                placeholder="Search shift name or code"
                value={shiftId}
                query={shiftQuery}
                setQuery={setShiftQuery}
                options={filteredShifts.map((item) => ({
                  id: item.id,
                  label: `${item.name} (${item.code}) · ${item.startTime} – ${item.endTime}`,
                }))}
                onChange={setShiftId}
              />
            </>
          ) : (
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <p>
                <span className="text-slate-500">Site:</span>{" "}
                <span className="font-medium">{active?.siteName}</span>
              </p>
              <p className="mt-2">
                <span className="text-slate-500">Shift:</span>{" "}
                <span className="font-medium">
                  {active?.shiftType} ({active?.shiftStart} – {active?.shiftEnd}
                  )
                </span>
              </p>
            </div>
          )}
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-800">
                  Take {mode === "in" ? "Check-In" : "Check-Out"} Photo
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  A live browser camera capture is required.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCamera(true)}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium hover:bg-slate-50"
              >
                <Camera className="size-4" />
                {photo ? "Retake Photo" : "Take Photo"}
              </button>
            </div>
            {photo && (
              <img
                src={photo}
                alt="Current capture"
                className="mt-3 h-28 w-28 rounded-md object-cover"
              />
            )}
          </div>
          <div
            className={`rounded-lg border p-4 text-sm ${location && inside ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}
          >
            <div className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">{locationMessage}</p>
                {site && distance !== null && (
                  <p className="mt-1">
                    Distance from site: {Math.round(distance)} m. Allowed
                    radius: {site.geofenceRadius} m.
                  </p>
                )}
                {site && distance !== null && !inside && (
                  <p className="mt-1 font-medium">
                    You are outside the allowed check-in area for this site.
                  </p>
                )}
                {site &&
                  (site.latitude === null || site.longitude === null) && (
                    <p className="mt-1">
                      This site has no configured GPS location. Contact your
                      operations manager.
                    </p>
                  )}
              </div>
            </div>
          </div>
        </div>
        <footer className="grid grid-cols-2 gap-2 border-t border-slate-200 px-4 py-4 sm:flex sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={() => void submit()}
            className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? "Saving…" : mode === "in" ? "Check In" : "Check Out"}
          </button>
        </footer>
        {camera && (
          <LiveCamera
            onClose={() => setCamera(false)}
            onCaptured={(url) => {
              setPhoto(url);
              setCamera(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
