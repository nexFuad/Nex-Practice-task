import { apiRequest } from "./client";
import type { SignedInUser } from "@/app/login/auth.session";

export type LoginPayload = {
  employeeId: string;
  company: string;
  password: string;
  rememberMe: boolean;
};
type AuthResponse = { user: SignedInUser; dashboardPath: string };
export const refreshSession = () =>
  apiRequest<AuthResponse>("/api/auth/refresh", { method: "POST" });
export const login = (payload: LoginPayload) =>
  apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const getSession = () => apiRequest<AuthResponse>("/api/auth/session");
export const logout = () =>
  apiRequest<{ message: string }>("/api/auth/logout", { method: "POST" });
export const getProfile = (employeeId: string) =>
  apiRequest<SignedInUser>(
    `/api/auth/profile/${encodeURIComponent(employeeId)}`,
  );
export const updateProfile = (
  employeeId: string,
  payload: { fullName: string; profileImageUrl?: string | null },
) =>
  apiRequest<SignedInUser>(
    `/api/auth/profile/${encodeURIComponent(employeeId)}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
export const changePassword = (
  employeeId: string,
  payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  },
) =>
  apiRequest<SignedInUser>(
    `/api/auth/profile/${encodeURIComponent(employeeId)}/password`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
