import type { SignedInUser } from "./auth.session";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, init);
  if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(body?.message ?? "Unable to complete the request."); }
  return response.json() as Promise<T>;
}

export function login(payload: { employeeId: string; company: string; password: string; accountType: string }) {
  return request<{ user: SignedInUser; dashboardPath: string }>("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
export function getProfile(employeeId: string) { return request<SignedInUser>(`/api/auth/profile/${encodeURIComponent(employeeId)}`); }
export function updateProfile(employeeId: string, payload: { fullName: string; profileImageUrl?: string | null }) { return request<SignedInUser>(`/api/auth/profile/${encodeURIComponent(employeeId)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function changePassword(employeeId: string, payload: { currentPassword: string; newPassword: string; confirmPassword: string }) { return request<SignedInUser>(`/api/auth/profile/${encodeURIComponent(employeeId)}/password`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
