import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";
import { getSession, requireRoles } from "../auth/auth.guard.js";
const officerAttendanceRoutes = new Hono();
const earthRadius = 6_371_000;
const distanceMeters = (aLat, aLng, bLat, bLng) => {
    const radians = (value) => value * Math.PI / 180;
    const dLat = radians(bLat - aLat);
    const dLng = radians(bLng - aLng);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(radians(aLat)) * Math.cos(radians(bLat)) * Math.sin(dLng / 2) ** 2;
    return 2 * earthRadius * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};
const today = () => new Date().toISOString().slice(0, 10);
const dayRange = () => { const start = new Date(`${today()}T00:00:00.000Z`); const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1); return { start, end }; };
const numeric = (value) => typeof value === "number" && Number.isFinite(value);
const timing = (time, shiftTime) => {
    const [hours, minutes] = shiftTime.split(":").map(Number);
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Singapore", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(time);
    const actualHours = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
    const actualMinutes = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
    const variance = actualHours * 60 + actualMinutes - (hours * 60 + minutes);
    return { status: variance === 0 ? "ON_TIME" : variance > 0 ? "LATE" : "EARLY", variance };
};
async function details(sessionUserId, input) {
    if (!input.siteId || !input.shiftId || !input.photoUrl?.trim() || !numeric(input.latitude) || !numeric(input.longitude) || !numeric(input.accuracy))
        throw new Error("Site, shift, live photo and current location are required.");
    const user = await prisma.user.findUnique({ where: { id: sessionUserId }, include: { basic: true, sites: { include: { site: true } } } });
    if (!user)
        throw new Error("Officer account was not found.");
    const site = await prisma.site.findUnique({ where: { id: input.siteId } });
    const shift = await prisma.shift.findUnique({ where: { id: input.shiftId } });
    if (!site || site.status !== "ACTIVE")
        throw new Error("Selected site is unavailable.");
    if (!shift || shift.status !== "ACTIVE")
        throw new Error("Selected shift is unavailable.");
    if (user.sites.length && !user.sites.some(({ siteId }) => siteId === site.id))
        throw new Error("This site is not assigned to you.");
    if (shift.siteId && shift.siteId !== site.id)
        throw new Error("This shift is not available for the selected site.");
    if (site.latitude === null || site.longitude === null)
        throw new Error("This site has no configured check-in location. Contact your operations manager.");
    const distance = distanceMeters(input.latitude, input.longitude, site.latitude, site.longitude);
    if (distance > site.geofenceRadius)
        throw new Error(`You are outside the allowed check-in area for this site. Distance from site: ${Math.round(distance)} m. Allowed radius: ${site.geofenceRadius} m.`);
    return { user, site, shift, distance };
}
officerAttendanceRoutes.use("/*", requireRoles(["OFFICER"]));
officerAttendanceRoutes.get("/options", async (c) => {
    const session = getSession(c);
    const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { sites: { include: { site: true } } } });
    if (!user)
        return c.json({ message: "Officer not found." }, 404);
    const assignedIds = user.sites.map(({ siteId }) => siteId);
    const [sites, shifts] = await Promise.all([
        assignedIds.length ? prisma.site.findMany({ where: { id: { in: assignedIds }, status: "ACTIVE" }, orderBy: { name: "asc" } }) : prisma.site.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
        prisma.shift.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    ]);
    return c.json({ sites, shifts });
});
officerAttendanceRoutes.get("/active", async (c) => {
    const session = getSession(c);
    const { start, end } = dayRange();
    const record = await prisma.attendanceRecord.findFirst({ where: { userId: session.userId, shiftDate: { gte: start, lt: end }, checkInAt: { not: null }, checkOutAt: null }, orderBy: { checkInAt: "desc" } });
    const todayRecord = await prisma.attendanceRecord.findFirst({ where: { userId: session.userId, shiftDate: { gte: start, lt: end }, checkInAt: { not: null } }, orderBy: { checkInAt: "desc" } });
    return c.json({ record, todayRecord });
});
officerAttendanceRoutes.get("/history", async (c) => {
    const session = getSession(c);
    const page = Math.max(1, Number(c.req.query("page")) || 1);
    const query = c.req.query("query")?.trim();
    const type = c.req.query("type");
    const date = c.req.query("date");
    const where = { userId: session.userId, ...(date ? { shiftDate: { gte: new Date(`${date}T00:00:00.000Z`), lt: new Date(`${date}T23:59:59.999Z`) } } : {}), ...(type === "CHECK_IN" ? { checkOutAt: null } : type === "CHECK_OUT" ? { checkOutAt: { not: null } } : {}), ...(query ? { OR: [{ siteName: { contains: query, mode: "insensitive" } }, { siteCode: { contains: query, mode: "insensitive" } }, { shiftType: { contains: query, mode: "insensitive" } }] } : {}) };
    const [total, records] = await Promise.all([prisma.attendanceRecord.count({ where }), prisma.attendanceRecord.findMany({ where, orderBy: [{ shiftDate: "desc" }, { createdAt: "desc" }], skip: (page - 1) * 10, take: 10 })]);
    return c.json({ records, total, page, pageSize: 10 });
});
officerAttendanceRoutes.post("/check-in", async (c) => {
    try {
        const session = getSession(c);
        const input = await c.req.json();
        const { user, site, shift, distance } = await details(session.userId, input);
        const { start, end } = dayRange();
        const active = await prisma.attendanceRecord.findFirst({ where: { userId: user.id, checkInAt: { not: null }, checkOutAt: null } });
        if (active)
            return c.json({ message: "Check out from your active duty before starting another check-in." }, 409);
        const checkedInAt = new Date();
        const checkInTiming = timing(checkedInAt, shift.startTime);
        return c.json(await prisma.attendanceRecord.create({ data: { userId: user.id, employeeId: user.employeeId, employeeName: user.basic?.fullName ?? user.fullName, siteId: site.id, siteName: site.name, siteCode: site.code, shiftId: shift.id, shiftDate: start, shiftStart: shift.startTime, shiftEnd: shift.endTime, shiftType: shift.name, checkInAt: checkedInAt, checkInTimingStatus: checkInTiming.status, checkInVarianceMinutes: checkInTiming.variance, checkInLatitude: input.latitude, checkInLongitude: input.longitude, checkInLocationAccuracy: input.accuracy, checkInLocationCapturedAt: checkedInAt, checkInDistanceMeters: distance, checkInAllowedRadius: site.geofenceRadius, checkInValidationStatus: "WITHIN_RADIUS", checkInImageUrl: input.photoUrl.trim(), status: "ON_DUTY" } }), 201);
    }
    catch (error) {
        return c.json({ message: error instanceof Error ? error.message : "Unable to check in." }, 400);
    }
});
officerAttendanceRoutes.post("/check-out", async (c) => {
    try {
        const session = getSession(c);
        const input = await c.req.json();
        const { site, shift, distance } = await details(session.userId, input);
        const { start, end } = dayRange();
        const record = await prisma.attendanceRecord.findFirst({ where: { userId: session.userId, siteId: site.id, shiftId: shift.id, shiftDate: { gte: start, lt: end }, checkInAt: { not: null }, checkOutAt: null }, orderBy: { checkInAt: "desc" } });
        if (!record)
            return c.json({ message: "A valid active check-in for this site and shift is required before check-out." }, 409);
        const checkedOutAt = new Date();
        const checkOutTiming = timing(checkedOutAt, shift.endTime);
        return c.json(await prisma.attendanceRecord.update({ where: { id: record.id }, data: { checkOutAt: checkedOutAt, checkOutTimingStatus: checkOutTiming.status, checkOutVarianceMinutes: checkOutTiming.variance, checkOutLatitude: input.latitude, checkOutLongitude: input.longitude, checkOutLocationAccuracy: input.accuracy, checkOutLocationCapturedAt: checkedOutAt, checkOutDistanceMeters: distance, checkOutAllowedRadius: site.geofenceRadius, checkOutValidationStatus: "WITHIN_RADIUS", checkOutImageUrl: input.photoUrl.trim(), status: "COMPLETED" } }));
    }
    catch (error) {
        return c.json({ message: error instanceof Error ? error.message : "Unable to check out." }, 400);
    }
});
export { officerAttendanceRoutes };
