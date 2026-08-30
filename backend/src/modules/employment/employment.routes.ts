import { Hono, type Context } from "hono";
import { prisma } from "../../lib/prisma.js";

const employmentRoutes = new Hono();
type RecordInput = { employeeId?: string; dateJoin?: string; dateLeft?: string; probationPeriod?: string; noticePeriod?: string; status?: string; notificationDate?: string; confirmationDate?: string; remarks?: string };
type HistoryInput = { employeeId?: string; role?: string; roleStartDate?: string };
type CommitInput = { employeeId?: string; employmentRecords?: RecordInput[]; pwmHistory?: HistoryInput[] };
const date = (value?: string) => value ? new Date(value) : undefined;
const text = (value?: string) => value?.trim() || undefined;
const recordData = (input: RecordInput) => ({ employeeId: text(input.employeeId), dateLeft: date(input.dateLeft), probationPeriod: text(input.probationPeriod), noticePeriod: text(input.noticePeriod), status: text(input.status) ?? "Active", notificationDate: date(input.notificationDate), confirmationDate: date(input.confirmationDate), remarks: text(input.remarks) });

const listEmployment = async (c: Context) => {
  const employeeId = c.req.query("employeeId");
  const where = employeeId ? { employeeId } : undefined;
  return c.json({ employmentRecords: await prisma.employeeRecord.findMany({ where, orderBy: { createdAt: "desc" } }), pwmHistory: await prisma.pwmEmploymentRecord.findMany({ where, orderBy: { createdAt: "desc" } }) });
};
employmentRoutes.get("", listEmployment);
employmentRoutes.get("/", listEmployment);

employmentRoutes.post("/commit", async (c) => {
  const input = await c.req.json<CommitInput>();
  const records = input.employmentRecords ?? [];
  const history = input.pwmHistory ?? [];
  if (records.some((record) => !record.dateJoin)) return c.json({ message: "Every employment record needs Date Join." }, 400);
  if (history.some((row) => !row.role?.trim() || !row.roleStartDate)) return c.json({ message: "Every PWM history row needs role and start date." }, 400);
  await prisma.$transaction([
    ...records.map((record) => prisma.employeeRecord.create({ data: { ...recordData({ ...record, employeeId: input.employeeId ?? record.employeeId }), dateJoin: new Date(record.dateJoin!) } })),
    ...history.map((row) => prisma.pwmEmploymentRecord.create({ data: { employeeId: text(input.employeeId ?? row.employeeId), role: row.role!.trim(), roleStartDate: new Date(row.roleStartDate!) } })),
  ]);
  return c.json({ message: "Employment records saved successfully." }, 201);
});

employmentRoutes.post("/records", async (c) => {
  const input = await c.req.json<RecordInput>();
  if (!input.dateJoin) return c.json({ message: "Please select Date Join." }, 400);
  return c.json(await prisma.employeeRecord.create({ data: { ...recordData(input), dateJoin: new Date(input.dateJoin) } }), 201);
});

// Backward-compatible route for an already-open frontend bundle using the former URL shape.
employmentRoutes.post("/:legacyEmployeeId/records", async (c) => {
  const input = await c.req.json<RecordInput>();
  if (!input.dateJoin) return c.json({ message: "Please select Date Join." }, 400);
  return c.json(await prisma.employeeRecord.create({ data: { ...recordData(input), dateJoin: new Date(input.dateJoin) } }), 201);
});

employmentRoutes.put("/records/:recordId", async (c) => {
  const input = await c.req.json<RecordInput>();
  if (!input.dateJoin) return c.json({ message: "Please select Date Join." }, 400);
  const record = await prisma.employeeRecord.findUnique({ where: { id: c.req.param("recordId") } });
  if (!record) return c.json({ message: "Employment record not found." }, 404);
  return c.json(await prisma.employeeRecord.update({ where: { id: record.id }, data: { ...recordData(input), dateJoin: new Date(input.dateJoin) } }));
});

employmentRoutes.delete("/records/:recordId", async (c) => {
  const record = await prisma.employeeRecord.findUnique({ where: { id: c.req.param("recordId") } });
  if (!record) return c.json({ message: "Employment record not found." }, 404);
  await prisma.employeeRecord.delete({ where: { id: record.id } });
  return c.body(null, 204);
});

employmentRoutes.post("/pwm-history", async (c) => {
  const input = await c.req.json<HistoryInput>();
  if (!input.role?.trim() || !input.roleStartDate) return c.json({ message: "Please select a role and role start date." }, 400);
  return c.json(await prisma.pwmEmploymentRecord.create({ data: { employeeId: text(input.employeeId), role: input.role.trim(), roleStartDate: new Date(input.roleStartDate) } }), 201);
});

employmentRoutes.put("/pwm-history/:historyId", async (c) => {
  const input = await c.req.json<HistoryInput>();
  if (!input.role?.trim() || !input.roleStartDate) return c.json({ message: "Please select a role and role start date." }, 400);
  const history = await prisma.pwmEmploymentRecord.findUnique({ where: { id: c.req.param("historyId") } });
  if (!history) return c.json({ message: "PWM history record not found." }, 404);
  return c.json(await prisma.pwmEmploymentRecord.update({ where: { id: history.id }, data: { employeeId: text(input.employeeId), role: input.role.trim(), roleStartDate: new Date(input.roleStartDate) } }));
});

employmentRoutes.delete("/pwm-history/:historyId", async (c) => {
  const history = await prisma.pwmEmploymentRecord.findUnique({ where: { id: c.req.param("historyId") } });
  if (!history) return c.json({ message: "PWM history record not found." }, 404);
  await prisma.pwmEmploymentRecord.delete({ where: { id: history.id } });
  return c.body(null, 204);
});

export { employmentRoutes };
