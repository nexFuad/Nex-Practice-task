import { apiRequest } from "./client";

export type OfficerDashboardOverview = {
  employee: {
    fullName: string;
    employeeId: string;
    sites: { name: string; code: string }[];
  };
  attendance: {
    id: string;
    shiftDate: string;
    shiftStart: string;
    shiftEnd: string;
    status: string;
    siteName?: string | null;
  }[];
};
export const getOfficerDashboardOverview = () =>
  apiRequest<OfficerDashboardOverview>("/api/dashboard/officer/overview");
