import type { OfficerDashboardOverview } from "@/Types/dashboardTypes";
export type { OfficerDashboardOverview } from "@/Types/dashboardTypes";
import { apiRequest } from "./client";
export const getOfficerDashboardOverview = () =>
  apiRequest<OfficerDashboardOverview>("/api/dashboard/officer/overview");
