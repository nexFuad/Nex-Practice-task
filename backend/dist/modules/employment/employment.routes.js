import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";
const employmentRoutes = new Hono();
const date = (value) => value ? new Date(value) : undefined;
const text = (value) => value?.trim() || undefined;
const recordData = (input) => ({ dateLeft: date(input.dateLeft), probationPeriod: text(input.probationPeriod), noticePeriod: text(input.noticePeriod), status: text(input.status) ?? "Active", notificationDate: date(input.notificationDate), confirmationDate: date(input.confirmationDate), remarks: text(input.remarks) });
const findUser = (employeeId) => employeeId ? prisma.user.findUnique({ where: { employeeId: employeeId.trim() }, select: { id: true } }) : null;
const listEmployment = async (c) => {
    const employeeId = c.req.query("employeeId");
    const user = await findUser(employeeId);
    if (employeeId && !user)
        return c.json({ message: "Employee not found." }, 404);
    const userId = user?.id;
    const [employmentRecords, pwmHistory] = await Promise.all([
        prisma.employmentRecord.findMany({ where: userId ? { userId } : undefined, orderBy: { createdAt: "desc" } }),
        prisma.pwmEmploymentHistory.findMany({ where: userId ? { userId } : undefined, orderBy: { createdAt: "desc" } }),
    ]);
    return c.json({ employmentRecords, pwmHistory });
};
employmentRoutes.get("", listEmployment);
employmentRoutes.get("/", listEmployment);
employmentRoutes.post("/commit", async (c) => {
    const input = await c.req.json();
    const records = input.employmentRecords ?? [];
    const history = input.pwmHistory ?? [];
    if (records.some((record) => !record.dateJoin))
        return c.json({ message: "Every employment record needs Date Join." }, 400);
    if (history.some((row) => !row.role?.trim() || !row.roleStartDate))
        return c.json({ message: "Every PWM history row needs role and start date." }, 400);
    const employeeId = text(input.employeeId);
    const user = await findUser(employeeId);
    if (!user)
        return c.json({ message: "Save Basic information before saving employment records." }, 400);
    await prisma.$transaction([
        prisma.employmentRecord.deleteMany({ where: { userId: user.id } }),
        prisma.pwmEmploymentHistory.deleteMany({ where: { userId: user.id } }),
        ...records.map((record) => prisma.employmentRecord.create({ data: { userId: user.id, ...recordData(record), dateJoin: new Date(record.dateJoin) } })),
        ...history.map((row) => prisma.pwmEmploymentHistory.create({ data: { userId: user.id, role: row.role.trim(), roleStartDate: new Date(row.roleStartDate) } })),
    ]);
    return c.json({ message: "Employment records saved successfully." }, 201);
});
employmentRoutes.post("/records", async (c) => {
    const input = await c.req.json();
    if (!input.dateJoin)
        return c.json({ message: "Please select Date Join." }, 400);
    const user = await findUser(input.employeeId);
    if (!user)
        return c.json({ message: "Employee not found." }, 404);
    return c.json(await prisma.employmentRecord.create({ data: { userId: user.id, ...recordData(input), dateJoin: new Date(input.dateJoin) } }), 201);
});
// Backward-compatible route for an already-open frontend bundle using the former URL shape.
employmentRoutes.post("/:legacyEmployeeId/records", async (c) => {
    const input = await c.req.json();
    if (!input.dateJoin)
        return c.json({ message: "Please select Date Join." }, 400);
    const user = await findUser(c.req.param("legacyEmployeeId"));
    if (!user)
        return c.json({ message: "Employee not found." }, 404);
    return c.json(await prisma.employmentRecord.create({ data: { userId: user.id, ...recordData(input), dateJoin: new Date(input.dateJoin) } }), 201);
});
employmentRoutes.put("/records/:recordId", async (c) => {
    const input = await c.req.json();
    if (!input.dateJoin)
        return c.json({ message: "Please select Date Join." }, 400);
    const record = await prisma.employmentRecord.findUnique({ where: { id: c.req.param("recordId") } });
    if (!record)
        return c.json({ message: "Employment record not found." }, 404);
    return c.json(await prisma.employmentRecord.update({ where: { id: record.id }, data: { ...recordData(input), dateJoin: new Date(input.dateJoin) } }));
});
employmentRoutes.delete("/records/:recordId", async (c) => {
    const record = await prisma.employmentRecord.findUnique({ where: { id: c.req.param("recordId") } });
    if (!record)
        return c.json({ message: "Employment record not found." }, 404);
    await prisma.employmentRecord.delete({ where: { id: record.id } });
    return c.body(null, 204);
});
employmentRoutes.post("/pwm-history", async (c) => {
    const input = await c.req.json();
    if (!input.role?.trim() || !input.roleStartDate)
        return c.json({ message: "Please select a role and role start date." }, 400);
    const user = await findUser(input.employeeId);
    if (!user)
        return c.json({ message: "Employee not found." }, 404);
    return c.json(await prisma.pwmEmploymentHistory.create({ data: { userId: user.id, role: input.role.trim(), roleStartDate: new Date(input.roleStartDate) } }), 201);
});
employmentRoutes.put("/pwm-history/:historyId", async (c) => {
    const input = await c.req.json();
    if (!input.role?.trim() || !input.roleStartDate)
        return c.json({ message: "Please select a role and role start date." }, 400);
    const history = await prisma.pwmEmploymentHistory.findUnique({ where: { id: c.req.param("historyId") } });
    if (!history)
        return c.json({ message: "PWM history record not found." }, 404);
    return c.json(await prisma.pwmEmploymentHistory.update({ where: { id: history.id }, data: { role: input.role.trim(), roleStartDate: new Date(input.roleStartDate) } }));
});
employmentRoutes.delete("/pwm-history/:historyId", async (c) => {
    const history = await prisma.pwmEmploymentHistory.findUnique({ where: { id: c.req.param("historyId") } });
    if (!history)
        return c.json({ message: "PWM history record not found." }, 404);
    await prisma.pwmEmploymentHistory.delete({ where: { id: history.id } });
    return c.body(null, 204);
});
export { employmentRoutes };
