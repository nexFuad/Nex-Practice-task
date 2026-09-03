import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

const shiftsRoutes = new Hono();
type ShiftInput = { companyId?: string; name?: string; code?: string; category?: string; color?: string; startTime?: string; endTime?: string; durationHours?: number; visibleInRoster?: boolean; description?: string; status?: "ACTIVE" | "INACTIVE" };
const clean = (value?: string) => value?.trim() || undefined;

async function shiftData(input: ShiftInput) {
  if (!clean(input.name) || !clean(input.code) || !clean(input.startTime) || !clean(input.endTime)) throw new Error("Code, name, start time and end time are required.");
  const color = clean(input.color) ?? "#E5E7EB";
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) throw new Error("Color must be a valid 6-digit hex value, such as #E5E7EB.");
  const durationHours = Number(input.durationHours);
  if (!Number.isFinite(durationHours) || durationHours < 0) throw new Error("Duration must be zero or greater.");
  const visibleInRoster = input.visibleInRoster !== false;
  return { companyId: clean(input.companyId) ?? "default", name: input.name!.trim(), code: input.code!.trim().toUpperCase(), category: clean(input.category) ?? "Main", color: color.toUpperCase(), startTime: input.startTime!.trim(), endTime: input.endTime!.trim(), durationHours, visibleInRoster, description: clean(input.description), breakMinutes: 0, siteId: null, siteName: null, status: visibleInRoster ? "ACTIVE" : "INACTIVE" } as const;
}

shiftsRoutes.get("/", async (c) => {
  const query = clean(c.req.query("query")); const status = c.req.query("status"); const companyId = clean(c.req.query("companyId")) ?? "default";
  const requestedPage = Number(c.req.query("page") ?? "1"); const requestedPageSize = Number(c.req.query("pageSize") ?? "10");
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = Number.isInteger(requestedPageSize) ? Math.min(Math.max(requestedPageSize, 1), 100) : 10;
  const where: Prisma.ShiftWhereInput = { companyId, status: status === "ACTIVE" || status === "INACTIVE" ? status : undefined, OR: query ? [{ name: { contains: query, mode: "insensitive" as const } }, { code: { contains: query, mode: "insensitive" as const } }] : undefined };
  const [items, total, active, inactive, assignedSites] = await prisma.$transaction([
    prisma.shift.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.shift.count({ where }),
    prisma.shift.count({ where: { ...where, status: "ACTIVE" } }),
    prisma.shift.count({ where: { ...where, status: "INACTIVE" } }),
    prisma.shift.count({ where: { ...where, siteId: { not: null } } }),
  ]);
  return c.json({ items, page, pageSize, total, stats: { total, active, inactive, assignedSites } });
});
shiftsRoutes.post("/", async (c) => { try { return c.json(await prisma.shift.create({ data: await shiftData(await c.req.json<ShiftInput>()) }), 201); } catch (error) { const message = error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002" ? "A shift with this code already exists for this company." : error instanceof Error ? error.message : "Unable to create shift."; return c.json({ message }, 400); } });
shiftsRoutes.put("/:id", async (c) => { try { return c.json(await prisma.shift.update({ where: { id: c.req.param("id") }, data: await shiftData(await c.req.json<ShiftInput>()) })); } catch (error) { const message = error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002" ? "A shift with this code already exists for this company." : "Shift not found or could not be updated."; return c.json({ message }, 400); } });
shiftsRoutes.patch("/:id/status", async (c) => { const { status } = await c.req.json<{ status?: "ACTIVE" | "INACTIVE" }>(); if (status !== "ACTIVE" && status !== "INACTIVE") return c.json({ message: "Invalid shift status." }, 400); try { return c.json(await prisma.shift.update({ where: { id: c.req.param("id") }, data: { status } })); } catch { return c.json({ message: "Shift not found." }, 404); } });
shiftsRoutes.delete("/:id", async (c) => { try { await prisma.shift.delete({ where: { id: c.req.param("id") } }); return c.body(null, 204); } catch { return c.json({ message: "Shift not found." }, 404); } });
export { shiftsRoutes };
