import { apiRequest as request } from "@/Services/client";
export type OfficerSite = {
  id: string;
  name: string;
  code: string;
  latitude: number | null;
  longitude: number | null;
  geofenceRadius: number;
};
export type OfficerShift = {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  siteId: string | null;
};
export type OfficerRecord = {
  id: string;
  siteId: string | null;
  siteName: string | null;
  shiftId: string | null;
  shiftType: string | null;
  shiftStart: string;
  shiftEnd: string;
  shiftDate: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInImageUrl: string | null;
  checkOutImageUrl: string | null;
  status: string;
  checkInValidationStatus: string | null;
  checkOutValidationStatus: string | null;
  checkInTimingStatus: "EARLY" | "ON_TIME" | "LATE" | null;
  checkInVarianceMinutes: number | null;
  checkOutTimingStatus: "EARLY" | "ON_TIME" | "LATE" | null;
  checkOutVarianceMinutes: number | null;
};
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
