import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import type { UserInput } from "./types.js";

const usersRoutes = new Hono();
const includeSites = { sites: { include: { site: true } } } as const;
const trim = (value?: string) => value?.trim() || undefined;

usersRoutes.get("/", async (c) => c.json(await prisma.user.findMany({ include: includeSites, orderBy: { createdAt: "desc" } })));

usersRoutes.post("/", async (c) => {
  const input = await c.req.json<UserInput>();
  if (!input.fullName?.trim() || !input.employeeId?.trim() || !input.password || !input.nationality?.trim() || !input.phone?.trim() || !input.role?.trim()) return c.json({ message: "Please complete all required fields." }, 400);
  const siteIds = [...new Set(input.siteIds ?? [])];
  const vaccinated = input.vaccinated === "Yes" || input.vaccinated === true ? true : input.vaccinated === "No" || input.vaccinated === false ? false : undefined;
  const bypassGpsGeofence = Boolean(input.bypassGpsGeofence);
  if (input.deploymentSiteId && !await prisma.site.findUnique({ where: { id: input.deploymentSiteId }, select: { id: true } })) return c.json({ message: "Selected deployment site does not exist." }, 400);
  if (siteIds.length && await prisma.site.count({ where: { id: { in: siteIds } } }) !== siteIds.length) return c.json({ message: "One or more selected sites do not exist." }, 400);
  try {
    const user = await prisma.user.create({ data: {
      fullName: input.fullName.trim(), employeeId: input.employeeId.trim(), nric: trim(input.nric), passwordHash: await bcrypt.hash(input.password, 10), profileImageUrl: trim(input.profileImageUrl), dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined, nationality: input.nationality.trim(), gender: trim(input.gender), race: trim(input.race), religion: trim(input.religion), phone: input.phone.trim(), email: trim(input.email), nfcCode: trim(input.nfcCode), address: trim(input.address), role: input.role.trim(), secondaryRole: trim(input.secondaryRole), insurancePlan: trim(input.insurancePlan), primaryNokName: trim(input.primaryNokName), primaryNokRelationship: trim(input.primaryNokRelationship), primaryNokLanguage: trim(input.primaryNokLanguage), primaryNokPhone: trim(input.primaryNokPhone), secondaryNokName: trim(input.secondaryNokName), secondaryNokRelationship: trim(input.secondaryNokRelationship), secondaryNokLanguage: trim(input.secondaryNokLanguage), secondaryNokPhone: trim(input.secondaryNokPhone), vaccinated, bypassGpsGeofence, deploymentSiteId: trim(input.deploymentSiteId), sites: { create: siteIds.map((siteId) => ({ siteId })) },
    }, include: includeSites });
    return c.json(user, 201);
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") return c.json({ message: "Employee ID already exists." }, 409);
    console.error("Unable to create user:", error);
    return c.json({ message: "Unable to create employee. Please check the submitted details." }, 500);
  }
});

export { usersRoutes };
