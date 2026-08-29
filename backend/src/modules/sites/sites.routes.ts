import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";
import type { SiteInput } from "./types.js";

const sitesRoutes = new Hono();

const normalizeSite = (input: SiteInput) => ({
  ...input,
  name: input.name.trim(),
  code: input.code.trim().toUpperCase(),
  address: input.address.trim(),
});

sitesRoutes.get("/", async (c) => {
  const query = c.req.query("query")?.trim();
  const status = c.req.query("status");

  return c.json(await prisma.site.findMany({
    where: {
      ...(status === "ACTIVE" || status === "INACTIVE" ? { status } : {}),
      ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { code: { contains: query, mode: "insensitive" } }, { address: { contains: query, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "asc" },
  }));
});

sitesRoutes.post("/", async (c) => {
  const input = await c.req.json<SiteInput>();
  if (!input.name?.trim() || !input.code?.trim() || !input.address?.trim()) return c.json({ message: "Name, code, and address are required." }, 400);
  return c.json(await prisma.site.create({ data: normalizeSite(input) }), 201);
});

sitesRoutes.put("/:id", async (c) => {
  try { return c.json(await prisma.site.update({ where: { id: c.req.param("id") }, data: normalizeSite(await c.req.json<SiteInput>()) })); }
  catch { return c.json({ message: "Site not found or code already exists." }, 404); }
});

sitesRoutes.patch("/:id/status", async (c) => {
  const { status } = await c.req.json<{ status: "ACTIVE" | "INACTIVE" }>();
  if (status !== "ACTIVE" && status !== "INACTIVE") return c.json({ message: "Invalid status." }, 400);
  return c.json(await prisma.site.update({ where: { id: c.req.param("id") }, data: { status } }));
});

sitesRoutes.delete("/:id", async (c) => {
  try { await prisma.site.delete({ where: { id: c.req.param("id") } }); return c.body(null, 204); }
  catch { return c.json({ message: "Site not found." }, 404); }
});

export { sitesRoutes };
