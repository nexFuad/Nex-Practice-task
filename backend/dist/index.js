import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { sitesRoutes } from "./modules/sites/sites.routes.js";
import { seedSites } from "./modules/sites/sites.seed.js";
import { clientsRoutes } from "./modules/clients/clients.routes.js";
import { seedClients } from "./modules/clients/clients.seed.js";
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
app.use("/api/*", cors({ origin: "http://localhost:3000", credentials: true }));
app.get("/", (c) => c.json({ service: "Guardly API" }));
app.route("/api/auth", authRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/officer/attendance", officerAttendanceRoutes);
app.use("/api/sites/*", requireRoles(["ADMIN", "OM"]));
app.use("/api/sites", requireRoles(["ADMIN", "OM"]));
app.use("/api/clients/*", requireRoles(["ADMIN", "OM"]));
app.use("/api/clients", requireRoles(["ADMIN", "OM"]));
app.use("/api/users/*", requireRoles(["ADMIN", "OM"]));
app.use("/api/users", requireRoles(["ADMIN", "OM"]));
app.use("/api/employment/*", requireRoles(["ADMIN", "OM"]));
app.use("/api/employment", requireRoles(["ADMIN", "OM"]));
app.use("/api/attendance/*", requireRoles(["ADMIN", "OM"]));
app.use("/api/attendance", requireRoles(["ADMIN", "OM"]));
app.use("/api/shifts/*", requireRoles(["ADMIN", "OM"]));
app.use("/api/shifts", requireRoles(["ADMIN", "OM"]));
app.route("/api/sites", sitesRoutes);
app.route("/api/clients", clientsRoutes);
app.route("/api/users", usersRoutes);
app.route("/api/employment", employmentRoutes);
app.route("/api/attendance", attendanceRoutes);
app.route("/api/shifts", shiftsRoutes);
async function start() {
    await seedSites();
    await seedClients();
    await seedDemoLogin();
    const port = Number(process.env.PORT ?? 3001);
    const server = serve({ fetch: app.fetch, port }, (info) => {
        console.log(`Guardly API: http://localhost:${info.port}`);
    });
    server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
            console.log(`Guardly API is already running on http://localhost:${port}.`);
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
