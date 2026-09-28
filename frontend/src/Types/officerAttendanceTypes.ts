export type OfficerSite = {
  id: string;
  name: string;
  code: string;
  latitude: number | null;
  longitude: number | null;
  geofenceRadius: number;
};
export type OfficerShift = {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  siteId: string | null;
};
export type OfficerRecord = {
  id: string;
  siteId: string | null;
  siteName: string | null;
  shiftId: string | null;
  shiftType: string | null;
  shiftStart: string;
  shiftEnd: string;
  shiftDate: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInImageUrl: string | null;
  checkOutImageUrl: string | null;
  status: string;
  checkInValidationStatus: string | null;
  checkOutValidationStatus: string | null;
  checkInTimingStatus: "EARLY" | "ON_TIME" | "LATE" | null;
  checkInVarianceMinutes: number | null;
  checkOutTimingStatus: "EARLY" | "ON_TIME" | "LATE" | null;
  checkOutVarianceMinutes: number | null;
};
export type Position = { latitude: number; longitude: number; accuracy: number };
