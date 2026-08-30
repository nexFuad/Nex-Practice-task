import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";
import type { SiteInput } from "./types.js";

const sitesRoutes = new Hono();

const includeClients = { siteClients: { include: { client: true } } } as const;

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
    include: includeClients,
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
  return c.json(await prisma.site.create({ data: normalizeSite(input), include: includeClients }), 201);
});

sitesRoutes.get("/:id/clients", async (c) => {
  const site = await prisma.site.findUnique({ where: { id: c.req.param("id") }, include: includeClients });
  if (!site) return c.json({ message: "Site not found." }, 404);
  return c.json(site.siteClients.map(({ client }) => client));
});

sitesRoutes.put("/:id/clients", async (c) => {
  const { clientIds } = await c.req.json<{ clientIds?: string[] }>();
  if (!Array.isArray(clientIds) || clientIds.some((id) => typeof id !== "string")) return c.json({ message: "clientIds must be an array of client IDs." }, 400);
  const uniqueClientIds = [...new Set(clientIds)];
  const siteId = c.req.param("id");
  const [site, clients] = await Promise.all([prisma.site.findUnique({ where: { id: siteId }, select: { id: true } }), prisma.client.count({ where: { id: { in: uniqueClientIds } } })]);
  if (!site) return c.json({ message: "Site not found." }, 404);
  if (clients !== uniqueClientIds.length) return c.json({ message: "One or more clients do not exist." }, 400);
  await prisma.$transaction([
    prisma.siteClient.deleteMany({ where: { siteId } }),
    prisma.siteClient.createMany({ data: uniqueClientIds.map((clientId) => ({ siteId, clientId })), skipDuplicates: true }),
  ]);
  return c.json(await prisma.site.findUniqueOrThrow({ where: { id: siteId }, include: includeClients }));
});

sitesRoutes.put("/:id", async (c) => {
  try { return c.json(await prisma.site.update({ where: { id: c.req.param("id") }, data: normalizeSite(await c.req.json<SiteInput>()), include: includeClients })); }
  catch { return c.json({ message: "Site not found or code already exists." }, 404); }
});

sitesRoutes.patch("/:id/status", async (c) => {
  const { status } = await c.req.json<{ status: "ACTIVE" | "INACTIVE" }>();
  if (status !== "ACTIVE" && status !== "INACTIVE") return c.json({ message: "Invalid status." }, 400);
  return c.json(await prisma.site.update({ where: { id: c.req.param("id") }, data: { status }, include: includeClients }));
});

sitesRoutes.delete("/:id", async (c) => {
  try { await prisma.site.delete({ where: { id: c.req.param("id") } }); return c.body(null, 204); }
  catch { return c.json({ message: "Site not found." }, 404); }
});

export { sitesRoutes };
