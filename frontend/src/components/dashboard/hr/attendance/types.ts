export type AttendanceStatus = "ON_DUTY" | "COMPLETED" | "ABSENT";

export type AttendanceRecord = {
  id: string; employeeId: string; employeeName: string; siteId: string | null; siteName: string | null; siteCode: string | null; shiftDate: string; shiftStart: string; shiftEnd: string; shiftType: string | null; checkInAt: string | null; checkOutAt: string | null; checkInLatitude: number | null; checkInLongitude: number | null; checkInLocationAccuracy: number | null; checkInLocationCapturedAt: string | null; checkOutLatitude: number | null; checkOutLongitude: number | null; checkOutLocationAccuracy: number | null; checkOutLocationCapturedAt: string | null; checkInImageUrl: string | null; checkOutImageUrl: string | null; status: AttendanceStatus;
};
export type AttendanceFormValues = Omit<AttendanceRecord, "id" | "employeeName" | "siteName" | "siteCode">;
export type AttendanceEmployee = { employeeId: string; fullName: string };
export type AttendanceSite = { id: string; name: string; code: string };
export type AttendanceShift = { id: string; name: string; startTime: string; endTime: string; siteId: string | null; siteName: string | null };
