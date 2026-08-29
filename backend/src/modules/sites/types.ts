export type SiteInput = {
  name: string;
  code: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadius?: number;
  timezone?: string;
  status?: "ACTIVE" | "INACTIVE";
  assignedGuards?: number;
};
