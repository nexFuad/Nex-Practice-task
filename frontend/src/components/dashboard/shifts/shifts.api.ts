import type { Shift, ShiftPayload, ShiftStatus } from "./types";
const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const request = async <T>(path: string, options?: RequestInit) => { const response = await fetch(`${base}${path}`, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options?.headers } }); if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(body?.message ?? "Unable to complete the request."); } return response.status === 204 ? undefined as T : response.json() as Promise<T>; };
export const getShifts = (query = "", status = "ALL") => request<Shift[]>(`/api/shifts?query=${encodeURIComponent(query)}&status=${status}`);
export const createShift = (payload: ShiftPayload) => request<Shift>("/api/shifts", { method: "POST", body: JSON.stringify(payload) });
export const updateShift = (id: string, payload: ShiftPayload) => request<Shift>(`/api/shifts/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const updateShiftStatus = (id: string, status: ShiftStatus) => request<Shift>(`/api/shifts/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
export const deleteShift = (id: string) => request<void>(`/api/shifts/${id}`, { method: "DELETE" });
