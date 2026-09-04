import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import jwt, { type SignOptions } from "jsonwebtoken";

export type AppRole = "ADMIN" | "OM" | "OFFICER";
export type AuthSession = {
  accountId: string;
  userId: string;
  employeeId: string;
  role: AppRole;
  tokenType: "access" | "refresh";
};

const configuredSecret = process.env.AUTH_JWT_SECRET;

if (
  process.env.NODE_ENV === "production" &&
  (!configuredSecret || configuredSecret.length < 32)
) {
  throw new Error(
    "AUTH_JWT_SECRET must be set to a strong value (at least 32 characters) in production.",
  );
}

const secret = configuredSecret ?? "development-only-change-this-auth-jwt-secret";

export const sessionCookieName = "guardly_access";
export const refreshCookieName = "guardly_refresh";

export const normalizeRole = (role: string): AppRole => {
  const value = role.toUpperCase();

  if (value.includes("ADMIN")) return "ADMIN";
  if (value.includes("OFFICER")) return "OFFICER";

  return "OM";
};

const issueToken = (
  session: Omit<AuthSession, "tokenType">,
  tokenType: AuthSession["tokenType"],
  expiresIn: NonNullable<SignOptions["expiresIn"]>,
) => jwt.sign({ ...session, tokenType }, secret, { expiresIn });

export const createSessionToken = (session: Omit<AuthSession, "tokenType">) =>
  issueToken(session, "access", "15m");

export const createRefreshToken = (session: Omit<AuthSession, "tokenType">) =>
  issueToken(session, "refresh", "90d");

export const getSession = (c: Context) => {
  const token = getCookie(c, sessionCookieName);
  if (!token) return null;

  try {
    const session = jwt.verify(token, secret) as AuthSession;
    return session.tokenType === "access" ? session : null;
  } catch {
    return null;
  }
};

export const getRefreshSession = (c: Context) => {
  const token = getCookie(c, refreshCookieName);
  if (!token) return null;

  try {
    const session = jwt.verify(token, secret) as AuthSession;
    return session.tokenType === "refresh" ? session : null;
  } catch {
    return null;
  }
};

export const requireRoles = (roles: AppRole[]) =>
  async (c: Context, next: Next) => {
    const session = getSession(c);
    if (!session) return c.json({ message: "Authentication required." }, 401);
    if (!roles.includes(session.role))
      return c.json({ message: "Access denied." }, 403);

    c.set("session", session);
    await next();
  };
