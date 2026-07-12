import { z } from "zod";

export const MANUAL_SUBSCRIPTION_PRICE_CENTS = 9900;

export const manualPaymentSchema = z.object({
  employerId: z.string().min(1),
  amountCents: z.number().int().positive(),
  pixCode: z.string().min(3),
  note: z.string().optional()
});

export const manualPixQrSchema = z.object({
  employerId: z.string().min(1),
  amountCents: z.number().int().positive(),
  pixKey: z.string().min(3),
  receiverName: z.string().min(2).max(25),
  receiverCity: z.string().min(2).max(25),
  description: z.string().min(2).max(72)
});

export const confirmManualPixSchema = manualPixQrSchema.extend({
  payload: z.string().min(20)
});
