import type {
  AttendanceEmployee,
  AttendanceFormValues,
  AttendanceRecord,
  AttendanceSite,
} from "./types";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
type Result = {
  records: AttendanceRecord[];
  page: number;
  pageSize: number;
  total: number;
  stats: { total: number; onDuty: number; completed: number };
};
const request = async <T>(path: string, options?: RequestInit) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "Unable to complete the request.");
  }
  return response.status === 204
    ? (undefined as T)
    : (response.json() as Promise<T>);
};
export const getAttendance = (
  month: string,
  employeeId: string,
  query: string,
  page = 1,
  pageSize = 10,
) =>
  request<Result>(
    `/api/attendance?month=${encodeURIComponent(month)}&employeeId=${encodeURIComponent(employeeId)}&query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`,
  );
export const createAttendance = (payload: Partial<AttendanceFormValues>) =>
  request<AttendanceRecord>("/api/attendance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateAttendance = (
  id: string,
  payload: Partial<AttendanceFormValues>,
) =>
  request<AttendanceRecord>(`/api/attendance/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteAttendance = (id: string) =>
  request<void>(`/api/attendance/${id}`, { method: "DELETE" });
export const getAttendanceEmployees = (month: string) =>
  request<AttendanceEmployee[]>(
    `/api/attendance/employees?month=${encodeURIComponent(month)}`,
  );
export const getAttendanceActiveEmployees = () =>
  request<AttendanceEmployee[]>("/api/attendance/active-employees");
export const getAttendanceSites = () =>
  request<{ items: AttendanceSite[] }>("/api/sites?page=1&pageSize=100").then(
    (result) => result.items,
  );
