import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { prisma } from "../../lib/prisma.js";
import { createSessionToken, getSession, normalizeRole, sessionCookieName } from "./auth.guard.js";
const authRoutes = new Hono();
const accountWithProfile = {
    id: true,
    employeeId: true,
    company: true,
    role: true,
    passwordChangedAt: true,
    fullName: true,
    email: true,
    profileImageUrl: true,
    user: { select: { id: true, basic: { select: { fullName: true, email: true } } } },
};
const normalizedId = (employeeId) => employeeId.trim().toLowerCase();
const profileResponse = (account) => ({
    id: account.id,
    employeeId: account.employeeId,
    fullName: account.fullName,
    company: account.company,
    email: account.email ?? account.user.basic?.email,
    role: normalizeRole(account.role),
    profileImageUrl: account.profileImageUrl,
    passwordChangedAt: account.passwordChangedAt,
});
authRoutes.post("/login", async (c) => {
    const input = await c.req.json();
    if (!input.employeeId?.trim() || !input.company?.trim() || !input.password)
        return c.json({ message: "Employee ID, company and password are required." }, 400);
    const account = await prisma.account.findUnique({ where: { employeeId: normalizedId(input.employeeId) }, select: { ...accountWithProfile, passwordHash: true } });
    if (!account || account.company.toLowerCase() !== input.company.trim().toLowerCase() || !await bcrypt.compare(input.password, account.passwordHash))
        return c.json({ message: "Invalid employee ID, company or password." }, 401);
    const role = normalizeRole(account.role);
    const dashboardPath = role === "ADMIN" ? "/admin/dashboard" : role === "OFFICER" ? "/officer/dashboard" : "/om/dashboard";
    const production = process.env.NODE_ENV === "production";
    setCookie(c, sessionCookieName, createSessionToken({ accountId: account.id, userId: account.user.id, employeeId: account.employeeId, role }), { httpOnly: true, sameSite: production ? "None" : "Lax", secure: production, path: "/", maxAge: 60 * 60 * 8 });
    const { passwordHash: _, ...safeAccount } = account;
    return c.json({ user: profileResponse(safeAccount), dashboardPath });
});
authRoutes.get("/session", async (c) => {
    const session = getSession(c);
    if (!session)
        return c.json({ message: "No active session." }, 401);
    const account = await prisma.account.findUnique({ where: { id: session.accountId }, select: accountWithProfile });
    if (!account)
        return c.json({ message: "Session account no longer exists." }, 401);
    return c.json({ user: profileResponse(account), dashboardPath: session.role === "ADMIN" ? "/admin/dashboard" : session.role === "OFFICER" ? "/officer/dashboard" : "/om/dashboard" });
});
authRoutes.post("/logout", (c) => { deleteCookie(c, sessionCookieName, { path: "/" }); return c.json({ message: "Logged out." }); });
authRoutes.get("/profile/:employeeId", async (c) => {
    const session = getSession(c);
    if (!session)
        return c.json({ message: "Authentication required." }, 401);
    if (session.employeeId !== normalizedId(c.req.param("employeeId")) && session.role !== "ADMIN" && session.role !== "OM")
        return c.json({ message: "Access denied." }, 403);
    const account = await prisma.account.findUnique({ where: { employeeId: normalizedId(c.req.param("employeeId")) }, select: accountWithProfile });
    return account ? c.json(profileResponse(account)) : c.json({ message: "Profile not found." }, 404);
});
authRoutes.patch("/profile/:employeeId", async (c) => {
    const session = getSession(c);
    if (!session)
        return c.json({ message: "Authentication required." }, 401);
    if (session.employeeId !== normalizedId(c.req.param("employeeId")) && session.role !== "ADMIN" && session.role !== "OM")
        return c.json({ message: "Access denied." }, 403);
    const input = await c.req.json();
    if (!input.fullName?.trim())
        return c.json({ message: "Full name is required." }, 400);
    const employeeId = normalizedId(c.req.param("employeeId"));
    const existing = await prisma.account.findUnique({ where: { employeeId }, select: { id: true, userId: true } });
    if (!existing)
        return c.json({ message: "Profile not found." }, 404);
    const account = await prisma.account.update({ where: { id: existing.id }, data: {
            fullName: input.fullName.trim(), profileImageUrl: input.profileImageUrl?.trim() || null,
        }, select: accountWithProfile });
    await prisma.user.update({ where: { id: existing.userId }, data: { fullName: input.fullName.trim(), profileImageUrl: input.profileImageUrl?.trim() || null, basic: { upsert: { create: { fullName: input.fullName.trim() }, update: { fullName: input.fullName.trim() } } }, profile: { upsert: { create: { profileImageUrl: input.profileImageUrl?.trim() || null }, update: { profileImageUrl: input.profileImageUrl?.trim() || null } } } } });
    return c.json(profileResponse(account));
});
authRoutes.patch("/profile/:employeeId/password", async (c) => {
    const session = getSession(c);
    if (!session || session.employeeId !== normalizedId(c.req.param("employeeId")))
        return c.json({ message: "Access denied." }, 403);
    const input = await c.req.json();
    if (!input.currentPassword || !input.newPassword || !input.confirmPassword)
        return c.json({ message: "Complete all password fields." }, 400);
    if (input.newPassword.length < 6)
        return c.json({ message: "New password must have at least 6 characters." }, 400);
    if (input.newPassword !== input.confirmPassword)
        return c.json({ message: "New password and confirmation do not match." }, 400);
    const employeeId = normalizedId(c.req.param("employeeId"));
    const account = await prisma.account.findUnique({ where: { employeeId }, select: { passwordHash: true } });
    if (!account || !await bcrypt.compare(input.currentPassword, account.passwordHash))
        return c.json({ message: "Current password is incorrect." }, 400);
    const updated = await prisma.account.update({ where: { employeeId }, data: { passwordHash: await bcrypt.hash(input.newPassword, 10), passwordChangedAt: new Date() }, select: accountWithProfile });
    return c.json(profileResponse(updated));
});
export { authRoutes };
