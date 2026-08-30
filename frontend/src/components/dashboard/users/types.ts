export type UserRole = "OFFICER" | "OM";
export type UserStatus = "ACTIVE" | "INACTIVE";

export type DemoUser = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  assignedSite?: string;
  additionalSites?: number;
};
