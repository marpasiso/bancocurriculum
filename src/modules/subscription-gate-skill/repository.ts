import { Prisma, type PrismaClient } from "@prisma/client";
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

export async function findLatestSubscription(employerId: string) {
  return prisma.subscription.findFirst({
    where: { employerId },
    orderBy: { endsAt: "desc" }
  });
}

export async function findPendingSubscriptionPayment(employerId: string) {
  return prisma.payment.findFirst({
    where: {
      employerId,
      status: "RECORDED"
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function findOrCreatePendingSubscriptionPayment(input: {
  employerId: string;
  amountCents: number;
  pixCode: string;
  note: string;
  createdById: string;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw(Prisma.sql`
      SELECT id
      FROM Employer
      WHERE id = ${input.employerId}
      FOR UPDATE
    `);

    const existingPayment = await tx.payment.findFirst({
      where: {
        employerId: input.employerId,
        status: "RECORDED"
      },
      orderBy: { createdAt: "desc" }
    });

    if (existingPayment) {
      return { payment: existingPayment, created: false };
    }

    const payment = await tx.payment.create({
      data: input
    });

    return { payment, created: true };
  });
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
