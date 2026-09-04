export type SiteStatus = "ACTIVE" | "INACTIVE";

export type Site = {
  id: string;
  name: string;
  code: string;
  address: string;
  status: SiteStatus;
  assignedGuards: number;
  latitude?: string;
  longitude?: string;
};

export type SiteFormValues = Omit<Site, "id" | "assignedGuards">;

export const initialSites: Site[] = [
  {
    id: "1",
    name: "Elid Technology",
    code: "ETIHQ",
    address: "996 Bendemeer Road #06-09",
    status: "ACTIVE",
    assignedGuards: 34,
    latitude: "1.319183",
    longitude: "103.8198",
  },
  {
    id: "2",
    name: "Elid Technology Roving",
    code: "ETIROV",
    address: "996 Bendemeer Road #06-09 Singapore",
    status: "ACTIVE",
    assignedGuards: 35,
  },
];
