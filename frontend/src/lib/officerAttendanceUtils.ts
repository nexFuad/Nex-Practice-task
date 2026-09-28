import type { OfficerRecord, OfficerSite, Position } from "@/Types/officerAttendanceTypes";

export const position = () =>
  new Promise<Position>((resolve, reject) => {
    if (!navigator.geolocation)
      return reject(
        new Error(
          "GPS is unavailable. Enable location services and try again.",
        ),
      );
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        }),
      () =>
        reject(
          new Error(
            "Location permission is required. Enable location services and try again.",
          ),
        ),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  });
export const haversine = (a: Position, site: OfficerSite) => {
  if (site.latitude === null || site.longitude === null) return null;
  const rad = (n: number) => (n * Math.PI) / 180;
  const lat = rad(site.latitude - a.latitude);
  const lon = rad(site.longitude - a.longitude);
  const x =
    Math.sin(lat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(site.latitude)) *
      Math.sin(lon / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};
export const time = (value: string | null) =>
  value
    ? new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not recorded";
export const duration = (minutes: number) => {
  const value = Math.abs(minutes);
  const hours = Math.floor(value / 60);
  const remainder = value % 60;
  return hours
    ? `${hours}h${remainder ? ` ${remainder}m` : ""}`
    : `${remainder}m`;
};
export const timingLabel = (
  status: OfficerRecord["checkInTimingStatus"],
  variance: number | null,
) => {
  if (!status || variance === null) return "-";
  if (status === "ON_TIME") return "On time";
  return status === "LATE"
    ? `Late by ${duration(variance)}`
    : `${duration(variance)} early`;
};
