import type { EmploymentRecord, PwmHistory, SavedEmployment } from "@/Types/employmentTypes";
export type { EmploymentRecord, PwmHistory, SavedEmployment } from "@/Types/employmentTypes";
import { apiRequest } from "@/Services/client";
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
