import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";

export async function seedDemoLogin() {
  await prisma.user.upsert({
    where: { employeeId: "fuad123" },
    update: { company: "fuad", role: "OM Demo" },
    create: { fullName: "Fuad", employeeId: "fuad123", company: "fuad", passwordHash: await bcrypt.hash("123456", 10), passwordChangedAt: new Date(), nationality: "Bangladeshi", phone: "0000000000", role: "OM Demo" },
  });
}
