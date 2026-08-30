import { prisma } from "../../lib/prisma.js";
const initialClients = [
    { name: "Acme Facilities", email: "operations@acmefacilities.com" },
    { name: "Northstar Properties", email: "admin@northstarproperties.com" },
    { name: "Meridian Retail Group", email: "security@meridianretail.com" },
    { name: "Orchid Business Park", email: "contact@orchidbusinesspark.com" },
    { name: "Summit Logistics", email: "facilities@summitlogistics.com" },
];
export async function seedClients() {
    await prisma.client.createMany({ data: initialClients, skipDuplicates: true });
}
