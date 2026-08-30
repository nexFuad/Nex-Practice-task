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
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "Unable to complete the request.");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export async function getSites() {
  return (await request<ApiSite[]>(sitesUrl)).map(toSite);
}

export async function createSite(payload: SitePayload) {
  return toSite(await request<ApiSite>(sitesUrl, { method: "POST", body: JSON.stringify(payload) }));
}

export async function updateSite(id: string, payload: SitePayload) {
  return toSite(await request<ApiSite>(`${sitesUrl}/${id}`, { method: "PUT", body: JSON.stringify(payload) }));
}

export async function updateSiteStatus(id: string, status: SiteStatus) {
  return toSite(await request<ApiSite>(`${sitesUrl}/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }));
}

export async function deleteSite(id: string) {
  await request<void>(`${sitesUrl}/${id}`, { method: "DELETE" });
}

export async function getSiteClients(siteId: string) {
  return request<Client[]>(`${sitesUrl}/${siteId}/clients`);
}

export async function saveSiteClients(siteId: string, clientIds: string[]) {
  return toSite(await request<ApiSite>(`${sitesUrl}/${siteId}/clients`, { method: "PUT", body: JSON.stringify({ clientIds }) }));
}
