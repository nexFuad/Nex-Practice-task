import { getCookie } from "hono/cookie";
import jwt, {} from "jsonwebtoken";
const configuredSecret = process.env.AUTH_JWT_SECRET;
if (process.env.NODE_ENV === "production" &&
    (!configuredSecret || configuredSecret.length < 32)) {
    throw new Error("AUTH_JWT_SECRET must be set to a strong value (at least 32 characters) in production.");
}
const secret = configuredSecret ?? "development-only-change-this-auth-jwt-secret";
export const sessionCookieName = "guardly_access";
export const refreshCookieName = "guardly_refresh";
export const normalizeRole = (role) => {
    const value = role.toUpperCase();
    if (value.includes("ADMIN"))
        return "ADMIN";
    if (value.includes("OFFICER"))
        return "OFFICER";
    return "OM";
};
const issueToken = (session, tokenType, expiresIn) => jwt.sign({ ...session, tokenType }, secret, { expiresIn });
export const createSessionToken = (session) => issueToken(session, "access", "15m");
export const createRefreshToken = (session) => issueToken(session, "refresh", "30d");
export const getSession = (c) => {
    const token = getCookie(c, sessionCookieName);
    if (!token)
        return null;
    try {
        const session = jwt.verify(token, secret);
        return session.tokenType === "access" ? session : null;
    }
    catch {
        return null;
    }
};
export const getRefreshSession = (c) => {
    const token = getCookie(c, refreshCookieName);
    if (!token)
        return null;
    try {
        const session = jwt.verify(token, secret);
        return session.tokenType === "refresh" ? session : null;
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
