import { apiRequest as request } from "@/Services/client";
import type { OfficerRecord, OfficerShift, OfficerSite } from "@/Types/officerAttendanceTypes";
export type { OfficerRecord, OfficerShift, OfficerSite } from "@/Types/officerAttendanceTypes";

export const attendanceOptions = () =>
  request<{ sites: OfficerSite[]; shifts: OfficerShift[] }>(
    "/api/officer/attendance/options",
  );
export const activeAttendance = () =>
  request<{ record: OfficerRecord | null; todayRecord: OfficerRecord | null }>(
    "/api/officer/attendance/active",
  );
export const attendanceHistory = (
  page: number,
  query: string,
  type: string,
  date: string,
) =>
  request<{
    records: OfficerRecord[];
    total: number;
    page: number;
    pageSize: number;
  }>(
    `/api/officer/attendance/history?page=${page}&query=${encodeURIComponent(query)}&type=${type}&date=${date}`,
  );
export const checkIn = (payload: Record<string, unknown>) =>
  request<OfficerRecord>("/api/officer/attendance/check-in", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const checkOut = (payload: Record<string, unknown>) =>
  request<OfficerRecord>("/api/officer/attendance/check-out", {
    method: "POST",
    body: JSON.stringify(payload),
  });
