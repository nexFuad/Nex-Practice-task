"use client";
/* eslint-disable @next/next/no-img-element -- Live camera and Cloudinary URLs require direct image rendering. */

import {
  Camera,
  ChevronDown,
  LogIn,
  LogOut,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activeAttendance,
  attendanceHistory,
  attendanceOptions,
  checkIn,
  checkOut,
  type OfficerRecord,
  type OfficerShift,
  type OfficerSite,
} from "./officerAttendance.api";

type Position = { latitude: number; longitude: number; accuracy: number };
const cloudUpload = async (blob: Blob) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset)
    throw new Error(
      "Camera photo upload is not configured. Set the Cloudinary cloud name and unsigned upload preset.",
    );
  const form = new FormData();
  form.append("file", blob, "attendance-live-photo.jpg");
  form.append("upload_preset", uploadPreset);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form },
  );
  if (!response.ok) throw new Error("Unable to upload the live photo.");
  return ((await response.json()) as { secure_url: string }).secure_url;
};
const position = () =>
  new Promise<Position>((resolve, reject) => {
    if (!navigator.geolocation)
      return reject(
        new Error(
          "GPS is unavailable. Enable location services and try again.",
        ),
      );
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        }),
      () =>
        reject(
          new Error(
            "Location permission is required. Enable location services and try again.",
          ),
        ),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  });
const haversine = (a: Position, site: OfficerSite) => {
  if (site.latitude === null || site.longitude === null) return null;
  const rad = (n: number) => (n * Math.PI) / 180;
  const lat = rad(site.latitude - a.latitude);
  const lon = rad(site.longitude - a.longitude);
  const x =
    Math.sin(lat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(site.latitude)) *
      Math.sin(lon / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};
const time = (value: string | null) =>
  value
    ? new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not recorded";
const duration = (minutes: number) => {
  const value = Math.abs(minutes);
  const hours = Math.floor(value / 60);
  const remainder = value % 60;
  return hours
    ? `${hours}h${remainder ? ` ${remainder}m` : ""}`
    : `${remainder}m`;
};
const timingLabel = (
  status: OfficerRecord["checkInTimingStatus"],
  variance: number | null,
) => {
  if (!status || variance === null) return "-";
  if (status === "ON_TIME") return "On time";
  return status === "LATE"
    ? `Late by ${duration(variance)}`
    : `${duration(variance)} early`;
};

export function OfficerCheckInPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [date, setDate] = useState("");
  const [mode, setMode] = useState<"in" | "out" | null>(null);
  const [toast, setToast] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const optionsQuery = useQuery({ queryKey: ["officer", "attendance", "options"], queryFn: attendanceOptions });
  const activeQuery = useQuery({ queryKey: ["officer", "attendance", "active"], queryFn: activeAttendance });
  const historyQuery = useQuery({ queryKey: ["officer", "attendance", "history", page, query, type, date], queryFn: () => attendanceHistory(page, query, type, date) });
  const sites = optionsQuery.data?.sites ?? [];
  const shifts = optionsQuery.data?.shifts ?? [];
  const active = activeQuery.data?.record ?? null;
  const todayRecord = activeQuery.data?.todayRecord ?? null;
  const records = historyQuery.data?.records ?? [];
  const total = historyQuery.data?.total ?? 0;
  const success = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 4_000);
  };
  return (
    <section className="p-5 sm:p-7 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
          <p className="mt-1 text-sm text-slate-500">
            Record your check-in and check-out for your assigned duty.
          </p>
        </div>
      </div>
      {toast && (
        <p
          className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700"
          role="status"
        >
          {toast}
        </p>
      )}
      <DailyDutyCard
        record={todayRecord}
        active={active}
        onAction={() => setMode(active ? "out" : "in")}
      />
      <History
        records={records}
        total={total}
        page={page}
        query={query}
        type={type}
        date={date}
        setPage={setPage}
        setQuery={setQuery}
        setType={setType}
        setDate={setDate}
        onPreview={setPhotoPreview}
      />
      {mode && (
        <AttendanceModal
          mode={mode}
          sites={sites}
          shifts={shifts}
          active={active}
          onClose={() => setMode(null)}
          onSaved={async (message) => {
            setMode(null);
            success(message);
            await Promise.all([queryClient.invalidateQueries({ queryKey: ["officer", "attendance", "active"] }), queryClient.invalidateQueries({ queryKey: ["officer", "attendance", "history"] })]);
          }}
        />
      )}
      {photoPreview && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 p-4"
          onClick={() => setPhotoPreview(null)}
        >
          <img
            src={photoPreview}
            alt="Attendance photo"
            className="max-h-[85vh] max-w-full rounded-lg bg-white object-contain shadow-2xl"
          />
        </div>
      )}
    </section>
  );
}
function DailyDutyCard({
  record,
  active,
  onAction,
}: {
  record: OfficerRecord | null;
  active: OfficerRecord | null;
  onAction: () => void;
}) {
  const checkingOut = Boolean(active);
  return (
    <article className="mt-6 max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">
            Today&apos;s Duty
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {active?.siteName ?? "Ready for a new duty"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {active?.shiftType
              ? `${active.shiftType} (${active.shiftStart} – ${active.shiftEnd})`
              : "Select your site and shift to begin."}
          </p>
        </div>
        <span className="grid size-10 place-items-center rounded-lg bg-blue-100 text-blue-600">
          {checkingOut ? (
            <LogOut className="size-5" />
          ) : (
            <LogIn className="size-5" />
          )}
        </span>
      </div>
      {active && (
        <div className="mt-4 space-y-2 border-y border-slate-100 py-3 text-sm">
          <p>
            <span className="text-slate-500">Current Site:</span>{" "}
            <span className="font-medium">{active.siteName}</span>
          </p>
          <p>
            <span className="text-slate-500">Current Shift:</span>{" "}
            <span className="font-medium">
              {active.shiftType} ({active.shiftStart} – {active.shiftEnd})
            </span>
          </p>
          <p>
            <span className="text-slate-500">Check-in:</span>{" "}
            <span className="font-semibold">{time(active.checkInAt)}</span>
          </p>
          <Timing
            status={active.checkInTimingStatus}
            variance={active.checkInVarianceMinutes}
            action="in"
          />
        </div>
      )}
      {!active && record?.checkOutAt && (
        <p className="mt-4 text-xs text-slate-500">
          Last completed duty: {record.siteName} · {time(record.checkInAt)} –{" "}
          {time(record.checkOutAt)}
        </p>
      )}
      <button
        type="button"
        onClick={onAction}
        className="mt-4 h-9 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
      >
        {checkingOut ? "Check Out" : "Check In"}
      </button>
    </article>
  );
}
function AttendanceModal({
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
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4"
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
function Timing({
  status,
  variance,
  action,
}: {
  status: OfficerRecord["checkInTimingStatus"];
  variance: number | null;
  action: "in" | "out";
}) {
  const isRed =
    (action === "in" && status === "LATE") ||
    (action === "out" && status === "EARLY");
  return (
    <p
      className={`text-xs font-medium ${isRed ? "text-red-600" : "text-emerald-600"}`}
    >
      {timingLabel(status, variance)}
    </p>
  );
}
function SearchSelect({
  label,
  placeholder,
  value,
  query,
  setQuery,
  options,
  onChange,
  disabled,
}: {
  label: string;
  placeholder: string;
  value: string;
  query: string;
  setQuery: (value: string) => void;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.id === value);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div ref={root} className="relative">
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-left text-sm shadow-sm outline-none hover:bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
      >
        <span
          className={
            selected ? "truncate text-slate-900" : "truncate text-slate-400"
          }
        >
          {selected?.label ?? `Select ${label.toLowerCase()}`}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="mt-2 max-h-48 overflow-y-auto pr-1">
            {options.length ? (
              options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={`block w-full rounded-md px-3 py-2.5 text-left text-sm hover:bg-slate-100 ${value === option.id ? "bg-blue-50 text-blue-700" : ""}`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="p-3 text-sm text-slate-500">No matching options.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function LiveCamera({
  onClose,
  onCaptured,
}: {
  onClose: () => void;
  onCaptured: (url: string) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    let stream: MediaStream | null = null;
    void navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((value) => {
        stream = value;
        if (video.current) video.current.srcObject = value;
      })
      .catch(() =>
        setError(
          "Camera access is required. Allow camera access and try again.",
        ),
      );
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, []);
  const capture = () => {
    const element = video.current;
    const target = canvas.current;
    if (!element || !target) return;
    target.width = element.videoWidth;
    target.height = element.videoHeight;
    target.getContext("2d")?.drawImage(element, 0, 0);
    setUploading(true);
    target.toBlob(
      async (blob) => {
        try {
          if (!blob) throw new Error("Unable to capture photo.");
          onCaptured(await cloudUpload(blob));
        } catch (cause) {
          setError(
            cause instanceof Error ? cause.message : "Unable to save photo.",
          );
          setUploading(false);
        }
      },
      "image/jpeg",
      0.9,
    );
  };
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950/70 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-4">
        <div className="mb-3 flex justify-between">
          <h3 className="font-semibold">Live Camera</h3>
          <button onClick={onClose}>
            <X className="size-5" />
          </button>
        </div>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <video
          ref={video}
          autoPlay
          playsInline
          muted
          className="aspect-video w-full rounded-md bg-black object-cover"
        />
        <canvas ref={canvas} hidden />
        <button
          type="button"
          disabled={Boolean(error) || uploading}
          onClick={capture}
          className="mt-4 h-10 w-full rounded-md bg-blue-600 text-sm font-semibold text-white disabled:bg-slate-300"
        >
          {uploading ? "Uploading…" : "Capture Photo"}
        </button>
      </div>
    </div>
  );
}
function History({
  records,
  total,
  page,
  query,
  type,
  date,
  setPage,
  setQuery,
  setType,
  setDate,
  onPreview,
}: {
  records: OfficerRecord[];
  total: number;
  page: number;
  query: string;
  type: string;
  date: string;
  setPage: (n: number) => void;
  setQuery: (v: string) => void;
  setType: (v: string) => void;
  setDate: (v: string) => void;
  onPreview: (url: string) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / 10));
  return (
    <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <label className="relative min-w-0 flex-1 sm:min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
            placeholder="Search site, shift or date"
            className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm"
          />
        </label>
        <select
          value={type}
          onChange={(event) => {
            setPage(1);
            setType(event.target.value);
          }}
          className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm sm:w-auto"
        >
          <option value="ALL">All</option>
          <option value="CHECK_IN">Check In</option>
          <option value="CHECK_OUT">Check Out</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(event) => {
            setPage(1);
            setDate(event.target.value);
          }}
          className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm sm:w-auto"
        />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-y border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              {[
                "Date",
                "Site / Post",
                "Shift",
                "Check-In",
                "Check-Out",
                "Check-In Photo",
                "Check-Out Photo",
                "Status",
                "Location Validation",
              ].map((column) => (
                <th key={column} className="px-3 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length ? (
              records.map((record) => (
                <tr key={record.id} className="border-b border-slate-100">
                  <td className="px-3 py-3">
                    {new Date(record.shiftDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-3 py-3">{record.siteName ?? "-"}</td>
                  <td className="px-3 py-3">
                    {record.shiftType ?? "-"}
                    <br />
                    <span className="text-xs text-slate-500">
                      {record.shiftStart} – {record.shiftEnd}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <p>{time(record.checkInAt)}</p>
                    <Timing
                      status={record.checkInTimingStatus}
                      variance={record.checkInVarianceMinutes}
                      action="in"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <p>{time(record.checkOutAt)}</p>
                    <Timing
                      status={record.checkOutTimingStatus}
                      variance={record.checkOutVarianceMinutes}
                      action="out"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <PhotoButton
                      url={record.checkInImageUrl}
                      onPreview={onPreview}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <PhotoButton
                      url={record.checkOutImageUrl}
                      onPreview={onPreview}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      {record.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-emerald-700">
                    {record.checkOutValidationStatus ??
                      record.checkInValidationStatus ??
                      "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-10 text-center text-slate-500"
                >
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-500">
          {total} record{total === 1 ? "" : "s"}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-md border px-3 py-1.5 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-2 py-1.5">
            {page} / {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
            className="rounded-md border px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
function PhotoButton({
  url,
  onPreview,
}: {
  url: string | null;
  onPreview: (url: string) => void;
}) {
  return url ? (
    <button
      type="button"
      onClick={() => onPreview(url)}
      className="grid size-10 place-items-center overflow-hidden rounded-md border border-slate-200"
    >
      <img src={url} alt="Attendance" className="size-full object-cover" />
    </button>
  ) : (
    <span className="text-slate-400">-</span>
  );
}
