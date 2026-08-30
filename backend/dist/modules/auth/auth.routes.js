import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";
const authRoutes = new Hono();
const publicProfile = { id: true, employeeId: true, fullName: true, company: true, email: true, role: true, profileImageUrl: true, passwordChangedAt: true };
const normalizedId = (employeeId) => employeeId.trim().toLowerCase();
authRoutes.post("/login", async (c) => {
    const input = await c.req.json();
    if (!input.employeeId?.trim() || !input.company?.trim() || !input.password)
        return c.json({ message: "Employee ID, company and password are required." }, 400);
    const user = await prisma.user.findUnique({ where: { employeeId: normalizedId(input.employeeId) }, select: { ...publicProfile, passwordHash: true } });
    if (!user || user.company.toLowerCase() !== input.company.trim().toLowerCase() || !await bcrypt.compare(input.password, user.passwordHash))
        return c.json({ message: "Invalid employee ID, company or password." }, 401);
    const accountType = input.accountType?.toLowerCase() ?? "";
    const dashboardPath = accountType.includes("admin") ? "/admin/dashboard" : accountType.includes("officer") ? "/officer/dashboard" : "/om/dashboard";
    const { passwordHash: _, ...profile } = user;
    return c.json({ user: profile, dashboardPath });
});
authRoutes.get("/profile/:employeeId", async (c) => {
    const user = await prisma.user.findUnique({ where: { employeeId: normalizedId(c.req.param("employeeId")) }, select: publicProfile });
    return user ? c.json(user) : c.json({ message: "Profile not found." }, 404);
});
authRoutes.patch("/profile/:employeeId", async (c) => {
    const input = await c.req.json();
    if (!input.fullName?.trim())
        return c.json({ message: "Full name is required." }, 400);
    const user = await prisma.user.update({ where: { employeeId: normalizedId(c.req.param("employeeId")) }, data: { fullName: input.fullName.trim(), profileImageUrl: input.profileImageUrl?.trim() || null }, select: publicProfile }).catch(() => null);
    return user ? c.json(user) : c.json({ message: "Profile not found." }, 404);
});
authRoutes.patch("/profile/:employeeId/password", async (c) => {
    const input = await c.req.json();
    if (!input.currentPassword || !input.newPassword || !input.confirmPassword)
        return c.json({ message: "Complete all password fields." }, 400);
    if (input.newPassword.length < 6)
        return c.json({ message: "New password must have at least 6 characters." }, 400);
    if (input.newPassword !== input.confirmPassword)
        return c.json({ message: "New password and confirmation do not match." }, 400);
    const employeeId = normalizedId(c.req.param("employeeId"));
    const user = await prisma.user.findUnique({ where: { employeeId }, select: { passwordHash: true } });
    if (!user || !await bcrypt.compare(input.currentPassword, user.passwordHash))
        return c.json({ message: "Current password is incorrect." }, 400);
    const updated = await prisma.user.update({ where: { employeeId }, data: { passwordHash: await bcrypt.hash(input.newPassword, 10), passwordChangedAt: new Date() }, select: publicProfile });
    return c.json(updated);
});
export { authRoutes };
