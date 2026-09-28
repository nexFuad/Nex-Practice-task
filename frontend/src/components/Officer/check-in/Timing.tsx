"use client";

import type { OfficerRecord } from "@/Services/officerAttendance";
import { timingLabel } from "@/lib/officerAttendanceUtils";

export function Timing({
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
