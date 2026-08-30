import type { DemoUser } from "./types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
type ApiUser = {
  id: string;
  fullName: string;
  employeeId: string;
  email: string | null;
  phone: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
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
  return response.json() as Promise<T>;
};
const asUser = (user: ApiUser): DemoUser => ({
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
