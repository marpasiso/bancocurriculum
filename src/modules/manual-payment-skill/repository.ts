import { prisma } from "@/lib/prisma";
import type { ManualPaymentInput } from "./types";

export async function insertManualPixPayment(adminUserId: string, input: ManualPaymentInput) {
  return prisma.payment.create({
    data: {
      ...input,
      createdById: adminUserId
    }
  });
}

export async function insertPaidManualPixPayment(adminUserId: string, input: ManualPaymentInput) {
  return prisma.payment.create({
    data: {
      ...input,
      provider: "manual_pix",
      status: "PAID",
      paidAt: new Date(),
      createdById: adminUserId
    }
  });
}
