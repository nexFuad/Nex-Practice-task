import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";

const attendanceRoutes = new Hono();

type AttendanceInput = {
  employeeId?: string;
  siteId?: string;
  shiftDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
  shiftType?: string;
  checkInAt?: string;
  checkOutAt?: string;
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  checkOutLatitude?: number | null;
  checkOutLongitude?: number | null;
  checkInImageUrl?: string;
  checkOutImageUrl?: string;
  status?: "ON_DUTY" | "COMPLETED" | "ABSENT";
};

const clean = (value?: string) => value?.trim() || undefined;
const asDate = (value?: string) => value ? new Date(value) : undefined;
const validDate = (value?: string) => Boolean(value && !Number.isNaN(new Date(value).getTime()));

async function dataFor(input: AttendanceInput) {
  if (!clean(input.employeeId) || !validDate(input.shiftDate) || !clean(input.shiftStart) || !clean(input.shiftEnd)) {
    throw new Error("Employee, shift date, start time and end time are required.");
  }
  const employee = await prisma.user.findUnique({ where: { employeeId: input.employeeId!.trim() }, select: { employeeId: true, fullName: true } });
  if (!employee) throw new Error("Selected employee was not found.");
  const site = clean(input.siteId) ? await prisma.site.findUnique({ where: { id: input.siteId!.trim() }, select: { id: true, name: true, code: true } }) : null;
  if (clean(input.siteId) && !site) throw new Error("Selected site was not found.");
  const status = input.status ?? (input.checkOutAt ? "COMPLETED" : "ON_DUTY");
  return {
    employeeId: employee.employeeId,
    employeeName: employee.fullName,
    siteId: site?.id,
    siteName: site?.name,
    siteCode: site?.code,
    shiftDate: new Date(input.shiftDate!),
    shiftStart: input.shiftStart!.trim(),
    shiftEnd: input.shiftEnd!.trim(),
    shiftType: clean(input.shiftType),
    checkInAt: asDate(input.checkInAt),
    checkOutAt: asDate(input.checkOutAt),
    checkInLatitude: input.checkInLatitude ?? undefined,
    checkInLongitude: input.checkInLongitude ?? undefined,
    checkOutLatitude: input.checkOutLatitude ?? undefined,
    checkOutLongitude: input.checkOutLongitude ?? undefined,
    checkInImageUrl: clean(input.checkInImageUrl),
    checkOutImageUrl: clean(input.checkOutImageUrl),
    status,
  } as const;
}

attendanceRoutes.get("/", async (c) => {
  const month = c.req.query("month");
  const employeeId = clean(c.req.query("employeeId"));
  const query = clean(c.req.query("query"));
  const start = month && /^\d{4}-\d{2}$/.test(month) ? new Date(`${month}-01T00:00:00.000Z`) : undefined;
  const end = start ? new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)) : undefined;
  const records = await prisma.attendanceRecord.findMany({
    where: {
      employeeId: employeeId || undefined,
      shiftDate: start && end ? { gte: start, lt: end } : undefined,
      OR: query ? [{ employeeName: { contains: query, mode: "insensitive" } }, { employeeId: { contains: query, mode: "insensitive" } }, { siteName: { contains: query, mode: "insensitive" } }] : undefined,
    },
    orderBy: [{ shiftDate: "desc" }, { createdAt: "desc" }],
  });
  const stats = { total: records.length, onDuty: records.filter((record) => record.status === "ON_DUTY").length, completed: records.filter((record) => record.status === "COMPLETED").length };
  return c.json({ records, stats });
});

attendanceRoutes.post("/", async (c) => {
  try { return c.json(await prisma.attendanceRecord.create({ data: await dataFor(await c.req.json<AttendanceInput>()) }), 201); }
  catch (error) { return c.json({ message: error instanceof Error ? error.message : "Unable to save attendance record." }, 400); }
});

attendanceRoutes.put("/:recordId", async (c) => {
  const exists = await prisma.attendanceRecord.findUnique({ where: { id: c.req.param("recordId") }, select: { id: true } });
  if (!exists) return c.json({ message: "Attendance record not found." }, 404);
  try { return c.json(await prisma.attendanceRecord.update({ where: { id: exists.id }, data: await dataFor(await c.req.json<AttendanceInput>()) })); }
  catch (error) { return c.json({ message: error instanceof Error ? error.message : "Unable to update attendance record." }, 400); }
});

attendanceRoutes.delete("/:recordId", async (c) => {
  const exists = await prisma.attendanceRecord.findUnique({ where: { id: c.req.param("recordId") }, select: { id: true } });
  if (!exists) return c.json({ message: "Attendance record not found." }, 404);
  await prisma.attendanceRecord.delete({ where: { id: exists.id } });
  return c.body(null, 204);
});

export { attendanceRoutes };
