import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import type { UserInput } from "./types.js";

const usersRoutes = new Hono();
const includeAccount = {
  user: {
    include: {
      sites: { include: { site: true } },
      basic: true,
      profile: true,
      nextOfKin: { orderBy: { priority: "asc" } },
      employmentRecords: { orderBy: { createdAt: "desc" } },
      pwmHistory: { orderBy: { createdAt: "desc" } },
      payrollRecords: { orderBy: { createdAt: "desc" } },
    },
  },
} as const;
const trim = (value?: string) => value?.trim() || undefined;
const findAccountByIdentifier = (identifier: string) =>
  prisma.account.findFirst({
    where: {
      OR: [{ employeeId: identifier.toLowerCase() }, { userId: identifier }],
    },
    include: includeAccount,
  });
const userResponse = (
  account: Awaited<ReturnType<typeof prisma.account.findFirstOrThrow>> & {
    user: {
      sites: { site: { name: string } }[];
      basic: {
        fullName: string;
        email: string | null;
        phone: string | null;
      } | null;
      employmentRecords: { status: string; dateLeft: Date | null }[];
    };
  },
) => {
  const basic = account.user.basic;
  const resignation = account.user.employmentRecords.find(
    (record: { status: string; dateLeft: Date | null }) =>
      record.status.toLowerCase() === "resigned" && Boolean(record.dateLeft),
  );
  return {
    id: account.userId,
    fullName: account.fullName || basic?.fullName,
    employeeId: account.employeeId,
    email: account.email ?? basic?.email,
    phone: basic?.phone ?? null,
    role: account.role,
    status: resignation ? "RESIGNED" : account.status,
    profileImageUrl: account.profileImageUrl,
    sites: account.user.sites,
  };
};

const editorResponse = (account: any) => {
  const user = account.user;
  const basic = user.basic;
  const nok = user.nextOfKin ?? [];
  const byPriority = (priority: number) =>
    nok.find((item: { priority: number }) => item.priority === priority);
  const primary = byPriority(1);
  const secondary = byPriority(2);
  return {
    fullName: basic?.fullName ?? account.fullName ?? user.fullName,
    employeeId: account.employeeId,
    company: account.company ?? user.company,
    nric: basic?.nric ?? user.nric ?? "",
    employmentType: basic?.employmentType ?? "",
    dateOfBirth:
      (basic?.dateOfBirth ?? user.dateOfBirth)?.toISOString().slice(0, 10) ??
      "",
    nationality: basic?.nationality ?? user.nationality ?? "",
    gender: basic?.gender ?? user.gender ?? "",
    race: basic?.race ?? user.race ?? "",
    religion: basic?.religion ?? user.religion ?? "",
    phone: basic?.phone ?? user.phone ?? "",
    email: basic?.email ?? account.email ?? user.email ?? "",
    nfcCode: basic?.nfcCode ?? user.nfcCode ?? "",
    maritalStatus: basic?.maritalStatus ?? "",
    address: basic?.address ?? user.address ?? "",
    role: account.role ?? user.role,
    secondaryRole: basic?.secondaryRole ?? user.secondaryRole ?? "",
    insurancePlan: basic?.insurancePlan ?? user.insurancePlan ?? "",
    primaryNokName: primary?.name ?? user.primaryNokName ?? "",
    primaryNokRelationship:
      primary?.relationship ?? user.primaryNokRelationship ?? "",
    primaryNokLanguage: primary?.language ?? user.primaryNokLanguage ?? "",
    primaryNokPhone: primary?.phone ?? user.primaryNokPhone ?? "",
    secondaryNokName: secondary?.name ?? user.secondaryNokName ?? "",
    secondaryNokRelationship:
      secondary?.relationship ?? user.secondaryNokRelationship ?? "",
    secondaryNokLanguage:
      secondary?.language ?? user.secondaryNokLanguage ?? "",
    secondaryNokPhone: secondary?.phone ?? user.secondaryNokPhone ?? "",
    vaccinated:
      basic?.vaccinated === true
        ? "Yes"
        : basic?.vaccinated === false
          ? "No"
          : "",
    bypassGpsGeofence: basic?.bypassGpsGeofence ?? user.bypassGpsGeofence,
    deploymentSiteId: basic?.deploymentSiteId ?? user.deploymentSiteId ?? "",
    siteIds: user.sites.map((item: { siteId: string }) => item.siteId),
    siteAssignments: user.sites.map(
      (item: { siteId: string; site: { name: string; code: string; address: string; status: string } }) => ({
        id: item.siteId,
        name: item.site.name,
        code: item.site.code,
        address: item.site.address,
        status: item.site.status,
      }),
    ),
    profileImageUrl:
      account.profileImageUrl ??
      user.profile?.profileImageUrl ??
      user.profileImageUrl ??
      "",
    employmentRecords: user.employmentRecords,
    pwmEmploymentHistory: user.pwmHistory,
    payrollRecords: user.payrollRecords,
  };
};

usersRoutes.get("/", async (c) => {
  const accounts = await prisma.account.findMany({
    include: includeAccount,
    orderBy: { createdAt: "desc" },
  });
  return c.json(accounts.map((account) => userResponse(account)));
});

usersRoutes.get("/:id/schedule", async (c) => {
  const account = await findAccountByIdentifier(c.req.param("id"));
  if (!account) return c.json({ message: "Employee not found." }, 404);
  const records = await prisma.attendanceRecord.findMany({
    where: { employeeId: account.employeeId },
    orderBy: { shiftDate: "desc" },
    take: 20,
  });
  return c.json(records);
});

usersRoutes.patch("/:id/sites", async (c) => {
  const account = await findAccountByIdentifier(c.req.param("id"));
  if (!account) return c.json({ message: "Employee not found." }, 404);
  const body = await c.req.json<{ siteIds?: string[] }>();
  const siteIds = [...new Set(body.siteIds ?? [])];
  if (
    siteIds.length &&
    (await prisma.site.count({ where: { id: { in: siteIds } } })) !==
      siteIds.length
  )
    return c.json({ message: "One or more selected sites do not exist." }, 400);
  await prisma.user.update({
    where: { id: account.userId },
    data: {
      sites: { deleteMany: {}, create: siteIds.map((siteId) => ({ siteId })) },
    },
  });
  const updated = await findAccountByIdentifier(account.userId);
  return c.json(updated ? editorResponse(updated).siteAssignments : []);
});

usersRoutes.patch("/:id/password", async (c) => {
  const account = await findAccountByIdentifier(c.req.param("id"));
  if (!account) return c.json({ message: "Employee not found." }, 404);
  const { password } = await c.req.json<{ password?: string }>();
  if (!password || password.length < 6)
    return c.json({ message: "Password must be at least 6 characters." }, 400);
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: account.userId },
      data: { passwordHash, passwordChangedAt: new Date() },
    }),
    prisma.account.update({
      where: { id: account.id },
      data: { passwordHash, passwordChangedAt: new Date() },
    }),
  ]);
  return c.json({ message: "Password reset successfully." });
});

usersRoutes.patch("/:id/status", async (c) => {
  const account = await findAccountByIdentifier(c.req.param("id"));
  if (!account) return c.json({ message: "Employee not found." }, 404);
  const { status } = await c.req.json<{
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  }>();
  if (status !== "ACTIVE" && status !== "INACTIVE" && status !== "SUSPENDED")
    return c.json({ message: "Invalid user status." }, 400);
  await prisma.$transaction([
    prisma.user.update({ where: { id: account.userId }, data: { status } }),
    prisma.account.update({ where: { id: account.id }, data: { status } }),
  ]);
  return c.json({ message: "User status updated." });
});

usersRoutes.patch("/:id/resignation", async (c) => {
  const account = await findAccountByIdentifier(c.req.param("id"));
  if (!account) return c.json({ message: "Employee not found." }, 404);
  const employment = await prisma.employmentRecord.findFirst({
    where: { userId: account.userId },
    orderBy: { dateJoin: "desc" },
  });
  if (!employment)
    return c.json({ message: "No employment record found. Add a Date Join before marking this user as resigned." }, 400);
  const { lastWorkingDay } = await c.req.json<{ lastWorkingDay?: string }>();
  const dateLeft = lastWorkingDay ? new Date(lastWorkingDay) : null;
  if (!dateLeft || Number.isNaN(dateLeft.getTime()))
    return c.json({ message: "Please select a valid last working date." }, 400);
  if (dateLeft < employment.dateJoin)
    return c.json({ message: "The last working date cannot be before the Date Join." }, 400);
  await prisma.$transaction([
    prisma.employmentRecord.update({
      where: { id: employment.id },
      data: { dateLeft, status: "Resigned" },
    }),
    prisma.user.update({ where: { id: account.userId }, data: { status: "INACTIVE" } }),
    prisma.account.update({ where: { id: account.id }, data: { status: "INACTIVE" } }),
  ]);
  return c.json({ message: "User marked as resigned." });
});

usersRoutes.patch("/:id/activation", async (c) => {
  const account = await findAccountByIdentifier(c.req.param("id"));
  if (!account) return c.json({ message: "Employee not found." }, 404);
  const resignation = await prisma.employmentRecord.findFirst({
    where: { userId: account.userId, status: "Resigned", dateLeft: { not: null } },
    orderBy: { dateLeft: "desc" },
  });
  await prisma.$transaction([
    prisma.user.update({ where: { id: account.userId }, data: { status: "ACTIVE" } }),
    prisma.account.update({ where: { id: account.id }, data: { status: "ACTIVE" } }),
    ...(resignation ? [prisma.employmentRecord.update({ where: { id: resignation.id }, data: { dateLeft: null, status: "Active" } })] : []),
  ]);
  return c.json({ message: "User activated." });
});

usersRoutes.delete("/:id", async (c) => {
  const account = await findAccountByIdentifier(c.req.param("id"));
  if (!account) return c.json({ message: "Employee not found." }, 404);
  await prisma.user.delete({ where: { id: account.userId } });
  return c.body(null, 204);
});

usersRoutes.get("/:id/payroll", async (c) => {
  const account = await findAccountByIdentifier(c.req.param("id"));
  if (!account) return c.json({ message: "Employee not found." }, 404);
  const profile = await prisma.employeePayrollProfile.findUnique({
    where: { userId: account.userId },
    include: { bankAccounts: true, earnings: true, deductions: true },
  });
  return c.json({
    profile: profile ? { ...profile, bankAccounts: undefined, earnings: undefined, deductions: undefined } : null,
    bankAccounts: profile?.bankAccounts ?? [],
    earnings: profile?.earnings ?? [],
    deductions: profile?.deductions ?? [],
  });
});

usersRoutes.put("/:id/payroll", async (c) => {
  const account = await findAccountByIdentifier(c.req.param("id"));
  if (!account) return c.json({ message: "Employee not found." }, 404);
  const input = await c.req.json<{
    profile?: Record<string, unknown>;
    bankAccounts?: Record<string, unknown>[];
    earnings?: Record<string, unknown>[];
    deductions?: Record<string, unknown>[];
  }>();
  const profile = input.profile ?? {};
  const banks = input.bankAccounts ?? [];
  const earnings = input.earnings ?? [];
  const deductions = input.deductions ?? [];
  if (!Array.isArray(banks) || !Array.isArray(earnings) || !Array.isArray(deductions))
    return c.json({ message: "Payroll records must be valid arrays." }, 400);
  const string = (row: Record<string, unknown>, key: string) =>
    typeof row[key] === "string" ? row[key].trim() : "";
  const number = (key: string) => {
    const raw = string(profile, key);
    return raw ? Number(raw) : null;
  };
  const date = (key: string) => {
    const raw = string(profile, key);
    return raw ? new Date(raw) : null;
  };
  const positiveAmount = (row: Record<string, unknown>) => {
    const value = Number(string(row, "amount"));
    return Number.isFinite(value) && value > 0;
  };
  const distinct = (values: string[]) => new Set(values.map((value) => value.toLowerCase())).size === values.length;
  if (banks.some((bank) => !string(bank, "bank") || !string(bank, "accountName") || !string(bank, "accountNumber") || !string(bank, "branchCode")))
    return c.json({ message: "Every bank account needs bank, account name, account number, and branch code." }, 400);
  if (!distinct(banks.map((bank) => `${string(bank, "bank")}:${string(bank, "accountNumber")}`)))
    return c.json({ message: "Duplicate bank-account records are not allowed." }, 400);
  if (earnings.some((earning) => !string(earning, "name") || !positiveAmount(earning)))
    return c.json({ message: "Every fixed allowance needs a type and a positive amount." }, 400);
  if (!distinct(earnings.map((earning) => string(earning, "name"))))
    return c.json({ message: "Duplicate allowance types are not allowed." }, 400);
  if (deductions.some((deduction) => !string(deduction, "name") || !string(deduction, "accountNumber") || !positiveAmount(deduction)))
    return c.json({ message: "Every fixed deduction needs a type, account number, and a positive amount." }, 400);
  if (!distinct(deductions.map((deduction) => string(deduction, "name"))))
    return c.json({ message: "Duplicate deduction types are not allowed." }, 400);
  const selfHelpGroups = Array.isArray(profile.selfHelpGroups)
    ? profile.selfHelpGroups.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim())
    : [];
  if (!distinct(selfHelpGroups)) return c.json({ message: "This self-help group has already been added." }, 400);
  const sdlCalculation = string(profile, "sdlCalculation");
  if (sdlCalculation && sdlCalculation !== "Yes" && sdlCalculation !== "No")
    return c.json({ message: "SDL calculation must be Yes or No." }, 400);
  const fixedRestDays = string(profile, "fixedRestDays");
  if (fixedRestDays.includes(",")) return c.json({ message: "Only one fixed rest-day option can be selected." }, 400);
  const data = {
    workingDays: string(profile, "workingDays") || null,
    restDaysPerMonth: number("restDaysPerMonth"),
    workingHoursPerWeek: number("workingHoursPerWeek"),
    fixedRestDays: fixedRestDays || null,
    basicSalary: number("basicSalary"), decimalPlaces: Number(number("decimalPlaces") ?? 2),
    dailyRate: number("dailyRate"), hourlyRate: number("hourlyRate"), otHourlyRate: number("otHourlyRate"),
    excessDailyRate: number("excessDailyRate"), excessHourlyRate: number("excessHourlyRate"),
    fixedBasicSalary: number("fixedBasicSalary"), fixedGrossSalary: number("fixedGrossSalary"),
    basicHours: number("basicHours"), breakTime: number("breakTime"), maximumOtHours: number("maximumOtHours"),
    advancePaymentType: string(profile, "advancePaymentType") || null, calculationType: string(profile, "calculationType") || null,
    cpfType: string(profile, "cpfType") || null, cpfEffectiveDate: date("cpfEffectiveDate"),
    levyType: string(profile, "levyType") || null, employeeSkillType: string(profile, "employeeSkillType") || null,
    selfHelpGroups, sdlCalculation: sdlCalculation || null, paymentMethod: string(profile, "paymentMethod") || null, paymentRemarks: string(profile, "paymentRemarks") || null,
  };
  const nested = {
    bankAccounts: { deleteMany: {}, create: banks.map((bank) => ({ bank: string(bank, "bank"), accountName: string(bank, "accountName"), accountNumber: string(bank, "accountNumber"), branchCode: string(bank, "branchCode"), bankCode: string(bank, "bankCode") || null, swiftCode: string(bank, "swiftCode") || null })) },
    earnings: { deleteMany: {}, create: earnings.map((earning) => ({ name: string(earning, "name"), amount: Number(string(earning, "amount")), calculationRule: string(earning, "calculationRule") || null })) },
    deductions: { deleteMany: {}, create: deductions.map((deduction) => ({ name: string(deduction, "name"), amount: Number(string(deduction, "amount")), accountNumber: string(deduction, "accountNumber"), deductBeforeGross: deduction.deductBeforeGross === true })) },
  };
  const saved = await prisma.employeePayrollProfile.upsert({
    where: { userId: account.userId },
    create: { userId: account.userId, ...data, ...nested },
    update: { ...data, ...nested },
    include: { bankAccounts: true, earnings: true, deductions: true },
  });
  return c.json({ profile: { ...saved, bankAccounts: undefined, earnings: undefined, deductions: undefined }, bankAccounts: saved.bankAccounts, earnings: saved.earnings, deductions: saved.deductions });
});

usersRoutes.get("/:id", async (c) => {
  const account = await findAccountByIdentifier(c.req.param("id"));
  if (!account) return c.json({ message: "Employee not found." }, 404);
  return c.json(editorResponse(account));
});

usersRoutes.post("/", async (c) => {
  const input = await c.req.json<UserInput>();
  if (
    !input.fullName?.trim() ||
    !input.employeeId?.trim() ||
    !input.password ||
    !input.nationality?.trim() ||
    !input.phone?.trim() ||
    !input.role?.trim()
  )
    return c.json({ message: "Please complete all required fields." }, 400);
  const siteIds = [...new Set(input.siteIds ?? [])];
  const vaccinated =
    input.vaccinated === "Yes" || input.vaccinated === true
      ? true
      : input.vaccinated === "No" || input.vaccinated === false
        ? false
        : undefined;
  const bypassGpsGeofence = Boolean(input.bypassGpsGeofence);
  if (
    input.deploymentSiteId &&
    !(await prisma.site.findUnique({
      where: { id: input.deploymentSiteId },
      select: { id: true },
    }))
  )
    return c.json({ message: "Selected deployment site does not exist." }, 400);
  if (
    siteIds.length &&
    (await prisma.site.count({ where: { id: { in: siteIds } } })) !==
      siteIds.length
  )
    return c.json({ message: "One or more selected sites do not exist." }, 400);
  try {
    const user = await prisma.user.create({
      data: {
        fullName: input.fullName.trim(),
        employeeId: input.employeeId.trim().toLowerCase(),
        company: trim(input.company) ?? "fuad",
        nric: trim(input.nric),
        passwordHash: await bcrypt.hash(input.password, 10),
        profileImageUrl: trim(input.profileImageUrl),
        dateOfBirth: input.dateOfBirth
          ? new Date(input.dateOfBirth)
          : undefined,
        nationality: input.nationality.trim(),
        gender: trim(input.gender),
        race: trim(input.race),
        religion: trim(input.religion),
        phone: input.phone.trim(),
        email: trim(input.email),
        nfcCode: trim(input.nfcCode),
        address: trim(input.address),
        role: input.role.trim(),
        secondaryRole: trim(input.secondaryRole),
        insurancePlan: trim(input.insurancePlan),
        primaryNokName: trim(input.primaryNokName),
        primaryNokRelationship: trim(input.primaryNokRelationship),
        primaryNokLanguage: trim(input.primaryNokLanguage),
        primaryNokPhone: trim(input.primaryNokPhone),
        secondaryNokName: trim(input.secondaryNokName),
        secondaryNokRelationship: trim(input.secondaryNokRelationship),
        secondaryNokLanguage: trim(input.secondaryNokLanguage),
        secondaryNokPhone: trim(input.secondaryNokPhone),
        vaccinated,
        bypassGpsGeofence,
        deploymentSiteId: trim(input.deploymentSiteId),
        sites: { create: siteIds.map((siteId) => ({ siteId })) },
        basic: {
          create: {
            fullName: input.fullName.trim(),
            nric: trim(input.nric),
            employmentType: trim(input.employmentType),
            dateOfBirth: input.dateOfBirth
              ? new Date(input.dateOfBirth)
              : undefined,
            nationality: trim(input.nationality),
            gender: trim(input.gender),
            race: trim(input.race),
            religion: trim(input.religion),
            phone: trim(input.phone),
            email: trim(input.email),
            nfcCode: trim(input.nfcCode),
            maritalStatus: trim(input.maritalStatus),
            address: trim(input.address),
            secondaryRole: trim(input.secondaryRole),
            insurancePlan: trim(input.insurancePlan),
            vaccinated,
            bypassGpsGeofence,
            deploymentSiteId: trim(input.deploymentSiteId),
          },
        },
        profile: { create: { profileImageUrl: trim(input.profileImageUrl) } },
        account: {
          create: {
            employeeId: input.employeeId.trim().toLowerCase(),
            fullName: input.fullName.trim(),
            company: trim(input.company) ?? "fuad",
            email: trim(input.email),
            profileImageUrl: trim(input.profileImageUrl),
            passwordHash: await bcrypt.hash(input.password, 10),
            role: input.role.trim(),
          },
        },
        nextOfKin: {
          create: [
            {
              priority: 1,
              name: trim(input.primaryNokName),
              relationship: trim(input.primaryNokRelationship),
              language: trim(input.primaryNokLanguage),
              phone: trim(input.primaryNokPhone),
            },
            {
              priority: 2,
              name: trim(input.secondaryNokName),
              relationship: trim(input.secondaryNokRelationship),
              language: trim(input.secondaryNokLanguage),
              phone: trim(input.secondaryNokPhone),
            },
          ],
        },
      },
      include: { account: { include: includeAccount } },
    });
    return c.json(userResponse(user.account!), 201);
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "P2002"
    )
      return c.json({ message: "Employee ID already exists." }, 409);
    console.error("Unable to create user:", error);
    return c.json(
      {
        message:
          "Unable to create employee. Please check the submitted details.",
      },
      500,
    );
  }
});

usersRoutes.put("/:id", async (c) => {
  const originalEmployeeId = c.req.param("id");
  const input = await c.req.json<UserInput>();
  if (
    !input.fullName?.trim() ||
    !input.employeeId?.trim() ||
    !input.nationality?.trim() ||
    !input.phone?.trim() ||
    !input.role?.trim()
  )
    return c.json({ message: "Please complete all required fields." }, 400);
  const account = await findAccountByIdentifier(originalEmployeeId);
  if (!account) return c.json({ message: "Employee not found." }, 404);
  const employeeId = input.employeeId.trim().toLowerCase();
  const siteIds = [...new Set(input.siteIds ?? [])];
  if (
    siteIds.length &&
    (await prisma.site.count({ where: { id: { in: siteIds } } })) !==
      siteIds.length
  )
    return c.json({ message: "One or more selected sites do not exist." }, 400);
  const vaccinated =
    input.vaccinated === "Yes" || input.vaccinated === true
      ? true
      : input.vaccinated === "No" || input.vaccinated === false
        ? false
        : undefined;
  const shared = {
    fullName: input.fullName.trim(),
    company: trim(input.company) ?? "fuad",
    nric: trim(input.nric),
    dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
    nationality: input.nationality.trim(),
    gender: trim(input.gender),
    race: trim(input.race),
    religion: trim(input.religion),
    phone: input.phone.trim(),
    email: trim(input.email),
    nfcCode: trim(input.nfcCode),
    address: trim(input.address),
    role: input.role.trim(),
    secondaryRole: trim(input.secondaryRole),
    insurancePlan: trim(input.insurancePlan),
    primaryNokName: trim(input.primaryNokName),
    primaryNokRelationship: trim(input.primaryNokRelationship),
    primaryNokLanguage: trim(input.primaryNokLanguage),
    primaryNokPhone: trim(input.primaryNokPhone),
    secondaryNokName: trim(input.secondaryNokName),
    secondaryNokRelationship: trim(input.secondaryNokRelationship),
    secondaryNokLanguage: trim(input.secondaryNokLanguage),
    secondaryNokPhone: trim(input.secondaryNokPhone),
    vaccinated,
    bypassGpsGeofence: Boolean(input.bypassGpsGeofence),
    deploymentSiteId: trim(input.deploymentSiteId),
    profileImageUrl: trim(input.profileImageUrl),
  };
  try {
    const passwordHash = input.password
      ? await bcrypt.hash(input.password, 10)
      : undefined;
    const updated = await prisma.$transaction(async (tx) => {
      const basicData = {
        fullName: shared.fullName,
        nric: shared.nric,
        employmentType: trim(input.employmentType),
        dateOfBirth: shared.dateOfBirth,
        nationality: shared.nationality,
        gender: shared.gender,
        race: shared.race,
        religion: shared.religion,
        phone: shared.phone,
        email: shared.email,
        nfcCode: shared.nfcCode,
        maritalStatus: trim(input.maritalStatus),
        address: shared.address,
        secondaryRole: shared.secondaryRole,
        insurancePlan: shared.insurancePlan,
        vaccinated,
        bypassGpsGeofence: shared.bypassGpsGeofence,
        deploymentSiteId: shared.deploymentSiteId,
      };
      await tx.user.update({
        where: { id: account.userId },
        data: {
          ...shared,
          employeeId,
          ...(passwordHash
            ? { passwordHash, passwordChangedAt: new Date() }
            : {}),
          sites: {
            deleteMany: {},
            create: siteIds.map((siteId) => ({ siteId })),
          },
          basic: { upsert: { create: basicData, update: basicData } },
          profile: {
            upsert: {
              create: { profileImageUrl: shared.profileImageUrl },
              update: { profileImageUrl: shared.profileImageUrl },
            },
          },
          nextOfKin: {
            deleteMany: {},
            create: [
              {
                priority: 1,
                name: shared.primaryNokName,
                relationship: shared.primaryNokRelationship,
                language: shared.primaryNokLanguage,
                phone: shared.primaryNokPhone,
              },
              {
                priority: 2,
                name: shared.secondaryNokName,
                relationship: shared.secondaryNokRelationship,
                language: shared.secondaryNokLanguage,
                phone: shared.secondaryNokPhone,
              },
            ],
          },
        },
      });
      await tx.account.update({
        where: { id: account.id },
        data: {
          employeeId,
          fullName: shared.fullName,
          company: shared.company,
          email: shared.email,
          profileImageUrl: shared.profileImageUrl,
          role: shared.role,
          ...(passwordHash
            ? { passwordHash, passwordChangedAt: new Date() }
            : {}),
        },
      });
      return tx.account.findUniqueOrThrow({
        where: { id: account.id },
        include: includeAccount,
      });
    });
    return c.json(userResponse(updated));
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "P2002"
    )
      return c.json({ message: "Employee ID already exists." }, 409);
    console.error("Unable to update employee:", error);
    return c.json({ message: "Unable to update employee." }, 500);
  }
});

export { usersRoutes };
