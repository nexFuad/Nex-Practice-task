import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
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
  const requestedPage = Number(c.req.query("page") ?? "1");
  const requestedPageSize = Number(c.req.query("pageSize") ?? "10");
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = Number.isInteger(requestedPageSize) ? Math.min(Math.max(requestedPageSize, 1), 100) : 10;
  const where: Prisma.SiteWhereInput = {
    ...(status === "ACTIVE" || status === "INACTIVE" ? { status } : {}),
    ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" as const } }, { code: { contains: query, mode: "insensitive" as const } }, { address: { contains: query, mode: "insensitive" as const } }] } : {}),
  };

  const [items, total, active, inactive, withGuards] = await prisma.$transaction([
    prisma.site.findMany({ where, orderBy: { createdAt: "asc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.site.count({ where }),
    prisma.site.count({ where: { AND: [where, { status: "ACTIVE" }] } }),
    prisma.site.count({ where: { AND: [where, { status: "INACTIVE" }] } }),
    prisma.site.count({ where: { AND: [where, { assignedGuards: { gt: 0 } }] } }),
  ]);
  return c.json({ items, page, pageSize, total, stats: { total, active, inactive, withGuards } });
});

sitesRoutes.post("/", async (c) => {
  const input = await c.req.json<SiteInput>();
  if (!input.name?.trim() || !input.code?.trim() || !input.address?.trim()) return c.json({ message: "Name, code, and address are required." }, 400);
  return c.json(await prisma.site.create({ data: normalizeSite(input) }), 201);
});

sitesRoutes.get("/:id/assigned-guards", async (c) => {
  const site = await prisma.site.findUnique({
    where: { id: c.req.param("id") },
    select: {
      userSites: {
        orderBy: { assignedAt: "desc" },
        select: {
          assignedAt: true,
          user: {
            select: {
              id: true,
              fullName: true,
              employeeId: true,
              role: true,
              status: true,
              profileImageUrl: true,
              basic: { select: { fullName: true } },
            },
          },
        },
      },
    },
  });
  if (!site) return c.json({ message: "Site not found." }, 404);
  return c.json(
    site.userSites.map(({ user, assignedAt }) => ({
      id: user.id,
      fullName: user.basic?.fullName || user.fullName,
      employeeId: user.employeeId,
      role: user.role,
      status: user.status,
      profileImageUrl: user.profileImageUrl,
      assignedAt,
    })),
  );
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
