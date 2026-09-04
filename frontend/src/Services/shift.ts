import type { Shift, ShiftPayload } from "@/Types/shiftTypes";
import { apiRequest as request } from "@/Services/client";
export type PaginatedShifts = {
  items: Shift[];
  page: number;
  pageSize: number;
  total: number;
  stats: {
    total: number;
    active: number;
    inactive: number;
    assignedSites: number;
  };
};
export const getShifts = (
  filters: {
    query?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  } = {},
) => {
  const params = new URLSearchParams({
    query: filters.query ?? "",
    status: filters.status ?? "ALL",
    page: String(filters.page ?? 1),
    pageSize: String(filters.pageSize ?? 10),
  });
  return request<PaginatedShifts>(`/api/shifts?${params.toString()}`);
};
export const getShiftOptions = (status = "ALL") =>
  getShifts({ status, page: 1, pageSize: 100 }).then((result) => result.items);
export const createShift = (payload: ShiftPayload) =>
  request<Shift>("/api/shifts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateShift = (id: string, payload: ShiftPayload) =>
  request<Shift>(`/api/shifts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteShift = (id: string) =>
  request<void>(`/api/shifts/${id}`, { method: "DELETE" });
