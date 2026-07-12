import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function listEmployersForAdminConsole() {
  return prisma.employer.findMany({
    include: {
      user: { select: { email: true } },
      payments: { orderBy: { createdAt: "desc" } },
      subscriptions: { orderBy: { createdAt: "desc" } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function findEmployerForAdminConsole(employerId: string) {
  return prisma.employer.findUnique({
    where: { id: employerId },
    include: {
      user: { select: { email: true } },
      payments: { orderBy: { createdAt: "desc" } },
      subscriptions: { orderBy: { createdAt: "desc" } }
    }
  });
}

export async function findUserByEmailForAdminConsole(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });
}

export async function updateEmployerForAdminConsole(input: {
  employerId: string;
  userId: string;
  companyName: string;
  contactName: string;
  document: string;
  email: string;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: input.userId },
      data: { email: input.email }
    });

    return tx.employer.update({
      where: { id: input.employerId },
      data: {
        companyName: input.companyName,
        contactName: input.contactName,
        document: input.document
      },
      include: {
        user: { select: { email: true } },
        payments: { orderBy: { createdAt: "desc" } },
        subscriptions: { orderBy: { createdAt: "desc" } }
      }
    });
  });
}

export async function blockEmployerForAdminConsole(employerId: string) {
  return prisma.employer.update({
    where: { id: employerId },
    data: { isActive: false },
    select: { id: true, companyName: true, isActive: true }
  });
}

export async function unblockEmployerForAdminConsole(employerId: string) {
  return prisma.employer.update({
    where: { id: employerId },
    data: { isActive: true },
    select: { id: true, companyName: true, isActive: true }
  });
}

export type AdminCandidateSearchFilters = {
  q?: string;
  name?: string;
  city?: string;
  role?: string;
};

export async function listCandidatesForAdminConsole(query: string | AdminCandidateSearchFilters = "") {
  const filters = typeof query === "string" ? { q: query } : query;
  const conditions: Prisma.CandidateWhereInput[] = [];

  if (filters.q) {
    conditions.push({
      OR: [
        { fullName: { contains: filters.q } },
        { desiredRole: { contains: filters.q } },
        { city: { contains: filters.q } },
        { state: { contains: filters.q } }
      ]
    });
  }

  if (filters.name) {
    conditions.push({ fullName: { contains: filters.name } });
  }

  if (filters.city) {
    conditions.push({ city: { contains: filters.city } });
  }

  if (filters.role) {
    conditions.push({
      OR: [
        { desiredRole: { contains: filters.role } },
        { interestFunctions: { some: { systemJobFunction: { name: { contains: filters.role } } } } }
      ]
    });
  }

  return prisma.candidate.findMany({
    where: conditions.length > 0 ? { AND: conditions } : undefined,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      city: true,
      state: true,
      desiredRole: true,
      summary: true,
      isActive: true,
      createdAt: true,
      _count: { select: { views: true, consentSnapshots: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function findCandidateForAdminConsole(candidateId: string) {
  return prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      consentSnapshots: { orderBy: { acceptedAt: "desc" } },
      views: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          employer: { select: { companyName: true } }
        }
      },
      interestFunctions: {
        include: { systemJobFunction: { select: { name: true } } },
        orderBy: { createdAt: "asc" }
      }
    }
  });
}

export async function listCandidateAuditLogs(candidateId: string) {
  return prisma.auditLog.findMany({
    where: {
      entity: "Candidate",
      entityId: candidateId
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      action: true,
      createdAt: true,
      user: { select: { email: true, role: true } }
    }
  });
}

export async function findDataRequestForCandidateAnonymization(input: { email: string; fullName: string }) {
  return prisma.lgpdRequest.findFirst({
    where: {
      email: input.email,
      type: { in: ["DELETE_REVIEW", "REVOCATION"] }
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, createdAt: true }
  });
}

export async function updateCandidateForAdminConsole(input: {
  candidateId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  desiredRole: string;
  summary: string;
  experience: string;
  education: string;
  references?: string;
}) {
  return prisma.candidate.update({
    where: { id: input.candidateId },
    data: {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      city: input.city,
      state: input.state,
      desiredRole: input.desiredRole,
      summary: input.summary,
      experience: input.experience,
      education: input.education,
      references: input.references
    }
  });
}

export async function updateCandidateActiveStatus(candidateId: string, isActive: boolean) {
  return prisma.candidate.update({
    where: { id: candidateId },
    data: { isActive },
    select: { id: true, fullName: true, email: true, isActive: true }
  });
}

export async function anonymizeCandidateForAdminConsole(candidateId: string) {
  const anonymizedValue = `anonimizado-${candidateId.slice(-8)}`;

  return prisma.candidate.update({
    where: { id: candidateId },
    data: {
      fullName: "Candidato anonimizado",
      email: `${anonymizedValue}@anonimizado.local`,
      phone: "Anonimizado",
      city: "Anonimizado",
      state: "NA",
      desiredRole: "Anonimizado",
      summary: "Dados anonimizados por ação administrativa.",
      experience: "Dados anonimizados por ação administrativa.",
      education: "Dados anonimizados por ação administrativa.",
      references: null,
      isActive: false,
      consentIp: null,
      consentUserAgent: null
    },
    select: { id: true, fullName: true, email: true, isActive: true }
  });
}

export async function getAdminDashboardStats() {
  const now = new Date();
  const [
    candidateCount,
    employerCount,
    activeSubscriptionCount,
    confirmedPaymentCount,
    lgpdRequestCount,
    confirmedPaymentAmount
  ] = await Promise.all([
    prisma.candidate.count(),
    prisma.employer.count(),
    prisma.subscription.count({ where: { startsAt: { lte: now }, endsAt: { gt: now } } }),
    prisma.payment.count({ where: { status: { in: ["PAID", "USED"] } } }),
    prisma.lgpdRequest.count(),
    prisma.payment.aggregate({
      where: { status: { in: ["PAID", "USED"] } },
      _sum: { amountCents: true }
    })
  ]);
  const totalRevenueCents = confirmedPaymentAmount._sum.amountCents ?? 0;

  return {
    candidateCount,
    employerCount,
    activeSubscriptionCount,
    confirmedPaymentCount,
    lgpdRequestCount,
    totalRevenueCents,
    operationalCostCents: 0,
    estimatedNetCents: totalRevenueCents
  };
}

export async function listAdminUsersForConsole() {
  return prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function findAdminUserForManagement(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, isActive: true }
  });
}

export async function countActiveSuperAdmins() {
  return prisma.user.count({
    where: { role: "SUPER_ADMIN", isActive: true }
  });
}

export async function insertAdminUser(input: { email: string; passwordHash: string; role: "ADMIN" | "SUPER_ADMIN" }) {
  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
      isActive: true
    },
    select: { id: true, email: true, role: true, isActive: true }
  });
}

export async function updateAdminUserRole(userId: string, role: "ADMIN" | "SUPER_ADMIN") {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, role: true, isActive: true }
  });
}

export async function blockAdminUser(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: { id: true, email: true, role: true, isActive: true }
  });
}

export async function unblockAdminUser(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
    select: { id: true, email: true, role: true, isActive: true }
  });
}
