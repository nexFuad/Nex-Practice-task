import { prisma } from "../../lib/prisma.js";
const initialSites = [
    { name: "Elid Technology", code: "ETIHQ", address: "996 Bendemeer Road #06-09", latitude: 1.319183, longitude: 103.8198, geofenceRadius: 10000, assignedGuards: 34 },
    { name: "Elid Technology Roving", code: "ETIROV", address: "996 Bendemeer Road #06-09 Singapore", latitude: 1.319183, longitude: 103.8198, geofenceRadius: 10000, assignedGuards: 35 },
];
export async function seedSites() {
    if ((await prisma.site.count()) === 0) {
        await prisma.site.createMany({ data: initialSites });
    }
}
