import type { Client, Site, SiteStatus } from "./types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const sitesUrl = `${apiBaseUrl}/api/sites`;

type ApiSite = Omit<Site, "latitude" | "longitude"> & {
  latitude: number | null;
  longitude: number | null;
};

export type SitePayload = {
  name: string;
  code: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  status: SiteStatus;
};

export type AssignedSiteGuard = {
  id: string;
  fullName: string;
  employeeId: string;
  role: string;
  status: string;
  profileImageUrl: string | null;
  assignedAt: string;
};

function toSite(site: ApiSite): Site {
  return {
    ...site,
    latitude: site.latitude?.toString(),
    longitude: site.longitude?.toString(),
  };
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "Unable to complete the request.");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export type PaginatedSites = {
  items: Site[];
  page: number;
  pageSize: number;
  total: number;
  stats: {
    total: number;
    active: number;
    inactive: number;
    withGuards: number;
  };
};

export async function getSites(
  filters: {
    query?: string;
    status?: SiteStatus | "ALL";
    page?: number;
    pageSize?: number;
  } = {},
): Promise<PaginatedSites> {
  const params = new URLSearchParams();
  if (filters.query?.trim()) params.set("query", filters.query.trim());
  if (filters.status && filters.status !== "ALL")
    params.set("status", filters.status);
  params.set("page", String(filters.page ?? 1));
  params.set("pageSize", String(filters.pageSize ?? 10));
  const response = await request<
    Omit<PaginatedSites, "items"> & { items: ApiSite[] }
  >(`${sitesUrl}?${params.toString()}`);
  return { ...response, items: response.items.map(toSite) };
}

/** Small option lists use a capped request; paginated management screens use getSites. */
export async function getSiteOptions(status: SiteStatus | "ALL" = "ALL") {
  return (await getSites({ status, page: 1, pageSize: 100 })).items;
}

export async function createSite(payload: SitePayload) {
  return toSite(
    await request<ApiSite>(sitesUrl, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateSite(id: string, payload: SitePayload) {
  return toSite(
    await request<ApiSite>(`${sitesUrl}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateSiteStatus(id: string, status: SiteStatus) {
  return toSite(
    await request<ApiSite>(`${sitesUrl}/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  );
}

export async function deleteSite(id: string) {
  await request<void>(`${sitesUrl}/${id}`, { method: "DELETE" });
}

export async function getSiteClients(siteId: string) {
  return request<Client[]>(`${sitesUrl}/${siteId}/clients`);
}

export async function getAssignedSiteGuards(siteId: string) {
  return request<AssignedSiteGuard[]>(`${sitesUrl}/${siteId}/assigned-guards`);
}

export async function saveSiteClients(siteId: string, clientIds: string[]) {
  return toSite(
    await request<ApiSite>(`${sitesUrl}/${siteId}/clients`, {
      method: "PUT",
      body: JSON.stringify({ clientIds }),
    }),
  );
}
