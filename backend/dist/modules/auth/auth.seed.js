import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
export async function seedDemoLogin() {
    const developmentAccounts = [
        { employeeId: "omfuad", fullName: "Fuad (OM)", password: "123fuad", role: "OM" },
        { employeeId: "ofuad", fullName: "Fuad (Officer)", password: "1234fuad", role: "OFFICER" },
        { employeeId: "adminfuad", fullName: "Fuad (Admin)", password: "12345fuad", role: "ADMIN" },
    ];
    for (const entry of developmentAccounts) {
        const user = await prisma.user.upsert({
            where: { employeeId: entry.employeeId },
            update: { company: "fuad", role: entry.role, passwordHash: await bcrypt.hash(entry.password, 10), passwordChangedAt: new Date() },
            create: { fullName: entry.fullName, employeeId: entry.employeeId, company: "fuad", passwordHash: await bcrypt.hash(entry.password, 10), passwordChangedAt: new Date(), nationality: "Bangladeshi", phone: "0000000000", role: entry.role },
        });
        await prisma.employeeBasic.upsert({ where: { userId: user.id }, update: { fullName: entry.fullName }, create: { userId: user.id, fullName: entry.fullName, nationality: "Bangladeshi", phone: "0000000000" } });
        await prisma.userProfile.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
    }
    const users = await prisma.user.findMany({ include: { basic: true, profile: true } });
    await prisma.$transaction(users.map((item) => prisma.account.upsert({
        where: { userId: item.id },
        update: {
            employeeId: item.employeeId,
            fullName: item.basic?.fullName ?? item.fullName,
            company: item.company,
            email: item.basic?.email ?? item.email,
            profileImageUrl: item.profile?.profileImageUrl ?? item.profileImageUrl,
            passwordHash: item.passwordHash,
            passwordChangedAt: item.passwordChangedAt,
            role: item.role,
            status: item.status,
        },
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
