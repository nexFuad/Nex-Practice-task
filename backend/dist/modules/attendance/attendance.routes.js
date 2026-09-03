import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";
const attendanceRoutes = new Hono();
const clean = (value) => value?.trim() || undefined;
const asDate = (value) => value ? new Date(value) : undefined;
const validDate = (value) => Boolean(value && !Number.isNaN(new Date(value).getTime()));
const monthRange = (month) => {
    if (!month || !/^\d{4}-\d{2}$/.test(month))
        return null;
    const start = new Date(`${month}-01T00:00:00.000Z`);
    return {
        start,
        end: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)),
    };
};
async function dataFor(input) {
    if (!clean(input.employeeId) || !validDate(input.shiftDate) || !clean(input.shiftStart) || !clean(input.shiftEnd)) {
        throw new Error("Employee, shift date, start time and end time are required.");
    }
    const employee = await prisma.user.findUnique({ where: { employeeId: input.employeeId.trim() }, select: { employeeId: true, fullName: true, basic: { select: { fullName: true } } } });
    if (!employee)
        throw new Error("Selected employee was not found.");
    const site = clean(input.siteId) ? await prisma.site.findUnique({ where: { id: input.siteId.trim() }, select: { id: true, name: true, code: true } }) : null;
    if (clean(input.siteId) && !site)
        throw new Error("Selected site was not found.");
    const status = input.status ?? (input.checkOutAt ? "COMPLETED" : "ON_DUTY");
    return {
        employeeId: employee.employeeId,
        employeeName: employee.basic?.fullName ?? employee.fullName,
        siteId: site?.id,
        siteName: site?.name,
        siteCode: site?.code,
        shiftDate: new Date(input.shiftDate),
        shiftStart: input.shiftStart.trim(),
        shiftEnd: input.shiftEnd.trim(),
        shiftType: clean(input.shiftType),
        checkInAt: asDate(input.checkInAt),
        checkOutAt: asDate(input.checkOutAt),
        checkInLatitude: input.checkInLatitude ?? undefined,
        checkInLongitude: input.checkInLongitude ?? undefined,
        checkInLocationAccuracy: input.checkInLocationAccuracy ?? undefined,
        checkInLocationCapturedAt: asDate(input.checkInLocationCapturedAt ?? undefined),
        checkOutLatitude: input.checkOutLatitude ?? undefined,
        checkOutLongitude: input.checkOutLongitude ?? undefined,
        checkOutLocationAccuracy: input.checkOutLocationAccuracy ?? undefined,
        checkOutLocationCapturedAt: asDate(input.checkOutLocationCapturedAt ?? undefined),
        checkInImageUrl: clean(input.checkInImageUrl),
        checkOutImageUrl: clean(input.checkOutImageUrl),
        status,
    };
}
attendanceRoutes.get("/", async (c) => {
    const month = c.req.query("month");
    const employeeId = clean(c.req.query("employeeId"));
    const query = clean(c.req.query("query"));
    const requestedPage = Number(c.req.query("page") ?? "1");
    const requestedPageSize = Number(c.req.query("pageSize") ?? "10");
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const pageSize = Number.isInteger(requestedPageSize) ? Math.min(Math.max(requestedPageSize, 1), 100) : 10;
    const range = monthRange(month);
    const where = {
        employeeId: employeeId || undefined,
        shiftDate: range ? { gte: range.start, lt: range.end } : undefined,
        OR: query ? [{ employeeName: { contains: query, mode: "insensitive" } }, { employeeId: { contains: query, mode: "insensitive" } }, { siteName: { contains: query, mode: "insensitive" } }] : undefined,
    };
    const [records, total, onDuty, completed] = await prisma.$transaction([
        prisma.attendanceRecord.findMany({ where, orderBy: [{ shiftDate: "desc" }, { createdAt: "desc" }], skip: (page - 1) * pageSize, take: pageSize }),
        prisma.attendanceRecord.count({ where }),
        prisma.attendanceRecord.count({ where: { AND: [where, { status: "ON_DUTY" }] } }),
        prisma.attendanceRecord.count({ where: { AND: [where, { status: "COMPLETED" }] } }),
    ]);
    return c.json({ records, page, pageSize, total, stats: { total, onDuty, completed } });
});
attendanceRoutes.get("/employees", async (c) => {
    const range = monthRange(c.req.query("month"));
    const employees = await prisma.attendanceRecord.findMany({
        where: {
            shiftDate: range ? { gte: range.start, lt: range.end } : undefined,
        },
        select: { employeeId: true, employeeName: true },
        distinct: ["employeeId"],
        orderBy: { employeeName: "asc" },
    });
    return c.json(employees.map((employee) => ({
        employeeId: employee.employeeId,
        fullName: employee.employeeName,
    })));
});
attendanceRoutes.get("/active-employees", async (c) => {
    const employees = await prisma.user.findMany({
        where: { status: "ACTIVE" },
        select: {
            employeeId: true,
            fullName: true,
            basic: { select: { fullName: true } },
        },
        orderBy: { fullName: "asc" },
    });
    return c.json(employees.map((employee) => ({
        employeeId: employee.employeeId,
        fullName: employee.basic?.fullName ?? employee.fullName,
    })));
});
attendanceRoutes.post("/", async (c) => {
    try {
        return c.json(await prisma.attendanceRecord.create({ data: await dataFor(await c.req.json()) }), 201);
    }
    catch (error) {
        return c.json({ message: error instanceof Error ? error.message : "Unable to save attendance record." }, 400);
    }
});
attendanceRoutes.put("/:recordId", async (c) => {
    const exists = await prisma.attendanceRecord.findUnique({ where: { id: c.req.param("recordId") }, select: { id: true } });
    if (!exists)
        return c.json({ message: "Attendance record not found." }, 404);
    try {
        return c.json(await prisma.attendanceRecord.update({ where: { id: exists.id }, data: await dataFor(await c.req.json()) }));
    }
    catch (error) {
        return c.json({ message: error instanceof Error ? error.message : "Unable to update attendance record." }, 400);
    }
});
attendanceRoutes.delete("/:recordId", async (c) => {
    const exists = await prisma.attendanceRecord.findUnique({ where: { id: c.req.param("recordId") }, select: { id: true } });
    if (!exists)
        return c.json({ message: "Attendance record not found." }, 404);
    await prisma.attendanceRecord.delete({ where: { id: exists.id } });
    return c.body(null, 204);
});
export { attendanceRoutes };
