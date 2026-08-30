import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";

const clientsRoutes = new Hono();

clientsRoutes.get("/", async (c) => {
  const query = c.req.query("query")?.trim();
  return c.json(await prisma.client.findMany({
    where: query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] } : undefined,
    orderBy: { name: "asc" },
  }));
});

export { clientsRoutes };
