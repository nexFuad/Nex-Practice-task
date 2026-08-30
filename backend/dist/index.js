import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { sitesRoutes } from "./modules/sites/sites.routes.js";
import { seedSites } from "./modules/sites/sites.seed.js";
import { clientsRoutes } from "./modules/clients/clients.routes.js";
import { seedClients } from "./modules/clients/clients.seed.js";
const app = new Hono();
app.use("/api/*", cors({ origin: "http://localhost:3000" }));
app.get("/", (c) => c.json({ service: "Guardly API" }));
app.route("/api/sites", sitesRoutes);
app.route("/api/clients", clientsRoutes);
async function start() {
    await seedSites();
    await seedClients();
    const port = Number(process.env.PORT ?? 3001);
    serve({ fetch: app.fetch, port }, (info) => {
        console.log(`Guardly API: http://localhost:${info.port}`);
    });
}
start().catch((error) => {
    console.error(error);
    process.exit(1);
});
