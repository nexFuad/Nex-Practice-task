import type { DemoUser } from "./types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
type ApiUser = {
  id: string;
  fullName: string;
  employeeId: string;
  email: string | null;
  phone: string;
  role: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "RESIGNED";
  sites: { site: { name: string } }[];
};
export type CreateUserPayload = Record<
  string,
  string | boolean | string[] | undefined
>;
const request = async <T>(url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    ...options,
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
const asUser = (user: ApiUser): DemoUser => ({
  databaseId: user.id,
  id: user.employeeId,
  name: user.fullName,
  email: user.email ?? undefined,
  phone: user.phone,
  role:
    user.role.toUpperCase().includes("MANAGER") || user.role === "OM"
      ? "OM"
      : "OFFICER",
  status: user.status,
  assignedSite: user.sites[0]?.site.name,
  additionalSites: Math.max(0, user.sites.length - 1),
});
export async function getUsers() {
  return (await request<ApiUser[]>(`${apiBaseUrl}/api/users`)).map(asUser);
}
export async function createUser(payload: CreateUserPayload) {
  return asUser(
    await request<ApiUser>(`${apiBaseUrl}/api/users`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
}

export type EditableEmployee = CreateUserPayload & { profileImageUrl?: string };

export function getUser(employeeId: string) {
  return request<EditableEmployee>(
    `${apiBaseUrl}/api/users/${encodeURIComponent(employeeId)}`,
  );
}

export function updateUser(employeeId: string, payload: CreateUserPayload) {
  return request<ApiUser>(
    `${apiBaseUrl}/api/users/${encodeURIComponent(employeeId)}`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
}

export type AssignedSite = { id: string; name: string; code: string };
export type UserScheduleRecord = {
  id: string;
  shiftDate: string;
  shiftStart: string;
  shiftEnd: string;
  siteName: string | null;
  status: string;
};

export function saveUserSites(employeeId: string, siteIds: string[]) {
  return request<AssignedSite[]>(`${apiBaseUrl}/api/users/${encodeURIComponent(employeeId)}/sites`, {
    method: "PATCH",
    body: JSON.stringify({ siteIds }),
  });
}

export function getUserSchedule(employeeId: string) {
  return request<UserScheduleRecord[]>(`${apiBaseUrl}/api/users/${encodeURIComponent(employeeId)}/schedule`);
}

export function resetUserPassword(employeeId: string, password: string) {
  return request<{ message: string }>(`${apiBaseUrl}/api/users/${encodeURIComponent(employeeId)}/password`, {
    method: "PATCH",
    body: JSON.stringify({ password }),
  });
}

export function setUserStatus(
  employeeId: string,
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED",
) {
  return request<{ message: string }>(`${apiBaseUrl}/api/users/${encodeURIComponent(employeeId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function resignUser(employeeId: string, lastWorkingDay: string) {
  return request<{ message: string }>(
    `${apiBaseUrl}/api/users/${encodeURIComponent(employeeId)}/resignation`,
    { method: "PATCH", body: JSON.stringify({ lastWorkingDay }) },
  );
}

export function activateUser(employeeId: string) {
  return request<{ message: string }>(
    `${apiBaseUrl}/api/users/${encodeURIComponent(employeeId)}/activation`,
    { method: "PATCH" },
  );
}

export async function deleteUser(employeeId: string) {
  await request<void>(`${apiBaseUrl}/api/users/${encodeURIComponent(employeeId)}`, { method: "DELETE" });
}

export type PayrollPayload = {
  profile: Record<string, string | string[]>;
  bankAccounts: Record<string, string>[];
  earnings: Record<string, string>[];
  deductions: Record<string, string | boolean>[];
};

export function getUserPayroll(userId: string) {
  return request<PayrollPayload>(
    `${apiBaseUrl}/api/users/${encodeURIComponent(userId)}/payroll`,
  );
}

export function updateUserPayroll(
  userId: string,
  payload: PayrollPayload,
) {
  return request<PayrollPayload>(
    `${apiBaseUrl}/api/users/${encodeURIComponent(userId)}/payroll`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
}
