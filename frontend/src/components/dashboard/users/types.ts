export type UserRole = "OFFICER" | "OM";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "RESIGNED";

export type DemoUser = {
  /** Internal database User.id, used for routes and API mutations. */
  databaseId: string;
  /** Employee ID shown to operations staff in the table. */
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  assignedSite?: string;
  additionalSites?: number;
};
