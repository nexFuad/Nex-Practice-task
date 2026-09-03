import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";
import { getSession, requireRoles } from "../auth/auth.guard.js";

const dashboardRoutes = new Hono();
dashboardRoutes.get("/officer/overview", requireRoles(["OFFICER"]), async (c) => {
  const session = getSession(c)!;
  const account = await prisma.account.findUnique({ where: { id: session.accountId }, include: { user: { include: { sites: { include: { site: true } } } } } });
  if (!account) return c.json({ message: "Profile not found." }, 404);
  const records = await prisma.attendanceRecord.findMany({ where: { employeeId: account.employeeId }, orderBy: [{ shiftDate: "desc" }, { createdAt: "desc" }], take: 5 });
  return c.json({ employee: { fullName: account.fullName, employeeId: account.employeeId, sites: account.user.sites.map(({ site }) => ({ name: site.name, code: site.code })) }, attendance: records });
});
export { dashboardRoutes };
