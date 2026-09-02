import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
export async function seedDemoLogin() {
    const user = await prisma.user.upsert({
        where: { employeeId: "fuad123" },
        update: { company: "fuad", role: "OM Demo" },
        create: { fullName: "Fuad", employeeId: "fuad123", company: "fuad", passwordHash: await bcrypt.hash("123456", 10), passwordChangedAt: new Date(), nationality: "Bangladeshi", phone: "0000000000", role: "OM Demo" },
    });
    await prisma.employeeBasic.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, fullName: "Fuad", nationality: "Bangladeshi", phone: "0000000000" },
    });
    await prisma.userProfile.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
    const users = await prisma.user.findMany({ include: { basic: true, profile: true } });
    await prisma.$transaction(users.map((item) => prisma.account.upsert({
        where: { userId: item.id },
        update: {},
        create: {
            userId: item.id,
            employeeId: item.employeeId,
            fullName: item.basic?.fullName ?? item.fullName,
            company: item.company,
            email: item.basic?.email ?? item.email,
            profileImageUrl: item.profile?.profileImageUrl ?? item.profileImageUrl,
            passwordHash: item.passwordHash,
            passwordChangedAt: item.passwordChangedAt,
            role: item.role,
            status: item.status,
            createdAt: item.createdAt,
        },
    })));
}
