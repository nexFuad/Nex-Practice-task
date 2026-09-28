import type { Site, SiteStatus } from "./siteTypes";

export type ApiSite = Omit<Site, "latitude" | "longitude"> & {
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
