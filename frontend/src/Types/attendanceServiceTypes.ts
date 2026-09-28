import type { AttendanceRecord } from "./attendanceTypes";

export type AttendanceListResult = {
  records: AttendanceRecord[];
  page: number;
  pageSize: number;
  total: number;
  stats: { total: number; onDuty: number; completed: number };
};
