const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
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
  const response = await fetch(
    `${apiBaseUrl}/api/employment${employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : ""}`,
    { credentials: "include" },
  );
  if (!response.ok) throw new Error("Unable to load saved employment records.");
  return response.json() as Promise<SavedEmployment>;
}
export async function saveEmploymentDraft(payload: {
  employeeId?: string;
  employmentRecords: Omit<EmploymentRecord, "id" | "createdAt">[];
  pwmHistory: Omit<PwmHistory, "id" | "createdAt">[];
}) {
  const response = await fetch(`${apiBaseUrl}/api/employment/commit`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "Unable to save employment records.");
  }
  return response.json();
}
