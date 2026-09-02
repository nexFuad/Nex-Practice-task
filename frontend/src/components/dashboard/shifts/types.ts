export type ShiftStatus = "ACTIVE" | "INACTIVE";
export type Shift = { id: string; companyId: string; name: string; code: string; category: string; color: string; startTime: string; endTime: string; durationHours: number; visibleInRoster: boolean; description: string | null; breakMinutes: number; siteId: string | null; siteName: string | null; status: ShiftStatus; createdAt: string; };
export type ShiftPayload = Pick<Shift, "companyId" | "name" | "code" | "category" | "color" | "startTime" | "endTime" | "durationHours" | "visibleInRoster" | "description">;
