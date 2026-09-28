import type { DemoUser } from "./userTypes";

export type ApiUser = {
  id: string;
  fullName: string;
  employeeId: string;
  email: string | null;
  phone: string;
  role: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "RESIGNED";
  sites: { site: { name: string } }[];
};

export type CreateUserPayload = Record<
  string,
  string | boolean | string[] | undefined
>;

export type PaginatedUsers = {
  items: DemoUser[];
  page: number;
  pageSize: number;
  total: number;
  stats: { total: number; activeOfficers: number; operationManagers: number };
};

export type UserFilterOptions = {
  roles: string[];
  statuses: string[];
};

export type EditableEmployee = CreateUserPayload & { profileImageUrl?: string };

export type AssignedSite = { id: string; name: string; code: string };

export type UserScheduleRecord = {
  id: string;
  shiftDate: string;
  shiftStart: string;
  shiftEnd: string;
  siteName: string | null;
  status: string;
};

export type PayrollPayload = {
  profile: Record<string, string | string[]>;
  bankAccounts: Record<string, string>[];
  earnings: Record<string, string>[];
  deductions: Record<string, string | boolean>[];
};
