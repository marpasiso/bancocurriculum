import { CommissionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateDeveloperCommissionData } from "./types";

export async function insertDeveloperCommission(data: CreateDeveloperCommissionData) {
  return prisma.developerCommission.create({
    data: {
      paymentId: data.paymentId,
      employerId: data.employerId,
      grossAmount: data.grossAmount,
      commissionRate: data.commissionRate,
      commissionAmount: data.commissionAmount,
      notes: data.notes
    }
  });
}

export async function findDeveloperCommissionByPaymentId(paymentId: string) {
  return prisma.developerCommission.findUnique({
    where: { paymentId }
  });
}

export async function listDeveloperCommissions() {
  return prisma.developerCommission.findMany({
    orderBy: { generatedAt: "desc" },
    include: {
      employer: { select: { id: true, companyName: true } },
      payment: { select: { id: true, status: true, paidAt: true } }
    }
  });
}

export async function listPendingDeveloperCommissionsForPeriod(input: { start: Date; end: Date }) {
  return prisma.developerCommission.findMany({
    where: {
      status: CommissionStatus.PENDING,
      generatedAt: {
        gte: input.start,
        lte: input.end
      }
    },
    orderBy: { generatedAt: "asc" },
    include: {
      employer: { select: { id: true, companyName: true } },
      payment: { select: { id: true, status: true, paidAt: true } }
    }
  });
}

export async function markDeveloperCommissionAsPaid(commissionId: string, notes?: string) {
  return prisma.developerCommission.update({
    where: { id: commissionId },
    data: {
      status: CommissionStatus.PAID,
      paidAt: new Date(),
      notes
    }
  });
}

export async function markDeveloperCommissionsAsPaid(commissionIds: string[], notes?: string) {
  if (commissionIds.length === 0) {
    return { count: 0 };
  }

  return prisma.developerCommission.updateMany({
    where: {
      id: { in: commissionIds },
      status: CommissionStatus.PENDING
    },
    data: {
      status: CommissionStatus.PAID,
      paidAt: new Date(),
      notes
    }
  });
}

export async function cancelDeveloperCommissionByPaymentId(paymentId: string, notes?: string) {
  return prisma.developerCommission.update({
    where: { paymentId },
    data: {
      status: CommissionStatus.CANCELED,
      notes
    }
  });
}
