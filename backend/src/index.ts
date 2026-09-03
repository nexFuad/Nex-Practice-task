import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { sitesRoutes } from "./modules/sites/sites.routes.js";
import { seedSites } from "./modules/sites/sites.seed.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { employmentRoutes } from "./modules/employment/employment.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { seedDemoLogin } from "./modules/auth/auth.seed.js";
import { attendanceRoutes } from "./modules/attendance/attendance.routes.js";
import { shiftsRoutes } from "./modules/shifts/shifts.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { requireRoles } from "./modules/auth/auth.guard.js";
import { officerAttendanceRoutes } from "./modules/attendance/officer-attendance.routes.js";

const app = new Hono();

const configuredFrontendUrl =
  process.env.FRONTEND_URL ?? "http://localhost:3000";
const production = process.env.NODE_ENV === "production";
if (production && !process.env.FRONTEND_URL?.startsWith("https://")) {
  throw new Error("FRONTEND_URL must be the HTTPS Vercel domain in production.");
}
const allowedFrontendOrigins = new Set(
  production
    ? [configuredFrontendUrl]
    : [configuredFrontendUrl, "http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
);
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

app.use("*", async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(self), geolocation=(self), microphone=()");
  c.header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  if (production) c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  await next();
});

app.use(
  "/api/*",
  cors({
    // Reflect only known browser origins. This supports local Next.js ports
    // during development while keeping the deployed Vercel origin restricted.
    origin: (origin) =>
      allowedFrontendOrigins.has(origin) ? origin : undefined,
    credentials: true,
  }),
);
app.use("/api/*", async (c, next) => {
  if (!unsafeMethods.has(c.req.method)) return next();
  const origin = c.req.header("origin");
  if (!origin || !allowedFrontendOrigins.has(origin)) {
    return c.json({ message: "Request origin is not allowed." }, 403);
  }
  await next();
});
app.get("/", (c) => c.json({ service: "Guardly API" }));
app.route("/api/auth", authRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/officer/attendance", officerAttendanceRoutes);
app.use("/api/sites/*", requireRoles(["ADMIN", "OM"]));
app.use("/api/sites", requireRoles(["ADMIN", "OM"]));
app.use("/api/users/*", requireRoles(["ADMIN", "OM"]));
app.use("/api/users", requireRoles(["ADMIN", "OM"]));
app.use("/api/employment/*", requireRoles(["ADMIN", "OM"]));
app.use("/api/employment", requireRoles(["ADMIN", "OM"]));
app.use("/api/attendance/*", requireRoles(["ADMIN", "OM"]));
app.use("/api/attendance", requireRoles(["ADMIN", "OM"]));
app.use("/api/shifts/*", requireRoles(["ADMIN", "OM"]));
app.use("/api/shifts", requireRoles(["ADMIN", "OM"]));
app.route("/api/sites", sitesRoutes);
app.route("/api/users", usersRoutes);
app.route("/api/employment", employmentRoutes);
app.route("/api/attendance", attendanceRoutes);
app.route("/api/shifts", shiftsRoutes);

async function start() {
  if (!production) {
    await seedSites();
    await seedDemoLogin();
  }
  const port = Number(process.env.PORT ?? 3001);
  const server = serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Guardly API: http://localhost:${info.port}`);
  });
  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.log(
        `Guardly API is already running on http://localhost:${port}.`,
      );
      process.exit(0);
    }
    console.error(error);
    process.exit(1);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
