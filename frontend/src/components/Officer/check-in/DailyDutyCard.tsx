"use client";

import { LogIn, LogOut } from "lucide-react";
import type { OfficerRecord } from "@/Services/officerAttendance";
import { time } from "@/lib/officerAttendanceUtils";
import { Timing } from "./Timing";

export function DailyDutyCard({
  record,
  active,
  loading,
  onAction,
}: {
  record: OfficerRecord | null;
  active: OfficerRecord | null;
  loading: boolean;
  onAction: () => void;
}) {
  const checkingOut = Boolean(active);
  if (loading) {
    return (
      <article
        aria-busy="true"
        aria-label="Loading today's duty"
        className="mt-6 max-w-xl animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-6 w-52 rounded bg-slate-200" />
            <div className="h-4 w-64 rounded bg-slate-100" />
          </div>
          <div className="size-10 rounded-lg bg-slate-100" />
        </div>
        <div className="mt-5 h-10 w-28 rounded-md bg-slate-200" />
      </article>
    );
  }
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
