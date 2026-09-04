import { apiRequest } from "@/Services/client";
export type EmploymentRecord = {
  id: string;
  employeeId?: string;
  dateJoin: string;
  dateLeft: string;
  probationPeriod: string;
  noticePeriod: string;
  status: string;
  notificationDate: string;
  confirmationDate: string;
  remarks: string;
  createdAt: string;
};
export type PwmHistory = {
  id: string;
  employeeId?: string;
  role: string;
  roleStartDate: string;
  createdAt: string;
};
export type SavedEmployment = {
  employmentRecords: EmploymentRecord[];
  pwmHistory: PwmHistory[];
};
export async function getSavedEmployment(employeeId?: string) {
  return apiRequest<SavedEmployment>(
    `/api/employment${employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : ""}`,
  );
}
export async function saveEmploymentDraft(payload: {
  employeeId?: string;
  employmentRecords: Omit<EmploymentRecord, "id" | "createdAt">[];
  pwmHistory: Omit<PwmHistory, "id" | "createdAt">[];
}) {
  return apiRequest("/api/employment/commit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
