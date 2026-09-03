import type { Shift, ShiftPayload } from "./types";
const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const request = async <T>(path: string, options?: RequestInit) => {
  const response = await fetch(`${base}${path}`, {
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
