import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function findEmployerAccessStatus(employerId: string) {
  return prisma.employer.findUnique({
    where: { id: employerId },
    select: { id: true, isActive: true }
  });
}

export async function findActiveSubscription(employerId: string, now = new Date()) {
  return prisma.subscription.findFirst({
    where: {
      employerId,
      startsAt: { lte: now },
      endsAt: { gt: now }
    },
    orderBy: { endsAt: "desc" }
  });
}

export async function hasSubscriptionHistory(employerId: string) {
  const count = await prisma.subscription.count({ where: { employerId } });
  return count > 0;
}

export async function findPaymentForActivation(employerId: string, paymentId: string) {
  return prisma.payment.findFirst({
    where: { id: paymentId, employerId }
  });
}

export async function createSubscriptionFromPayment(
  tx: Tx,
  input: {
    employerId: string;
    paymentId: string;
    startsAt: Date;
    endsAt: Date;
    createdById: string;
  }
) {
  return tx.subscription.create({ data: input });
}

export async function markPaymentUsed(tx: Tx, paymentId: string) {
  return tx.payment.update({
    where: { id: paymentId },
    data: { status: "USED" }
  });
}
