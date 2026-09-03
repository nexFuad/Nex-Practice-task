import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
const configuredSecret = process.env.AUTH_JWT_SECRET;
if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
    throw new Error("AUTH_JWT_SECRET must be set to a strong value (at least 32 characters) in production.");
}
const secret = configuredSecret ?? "development-only-change-this-auth-jwt-secret";
export const sessionCookieName = "guardly_session";
export const normalizeRole = (role) => {
    const value = role.toUpperCase();
    if (value.includes("ADMIN"))
        return "ADMIN";
    if (value.includes("OFFICER"))
        return "OFFICER";
    return "OM";
};
export const createSessionToken = (session) => jwt.sign(session, secret, { expiresIn: "8h" });
export const getSession = (c) => {
    const token = getCookie(c, sessionCookieName);
    if (!token)
        return null;
    try {
        return jwt.verify(token, secret);
    }
    catch {
        return null;
    }
};
export const requireRoles = (roles) => async (c, next) => {
    const session = getSession(c);
    if (!session)
        return c.json({ message: "Authentication required." }, 401);
    if (!roles.includes(session.role))
        return c.json({ message: "Access denied." }, 403);
    c.set("session", session);
    await next();
};
