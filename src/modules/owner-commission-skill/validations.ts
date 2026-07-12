import { z } from "zod";

export const generateDeveloperCommissionSchema = z.object({
  paymentId: z.string().min(1),
  employerId: z.string().min(1),
  grossAmountCents: z.number().int().positive(),
  notes: z.string().max(500).optional()
});

export const markDeveloperCommissionPaidSchema = z.object({
  commissionId: z.string().min(1),
  notes: z.string().max(500).optional()
});

export const cancelDeveloperCommissionSchema = z.object({
  paymentId: z.string().min(1),
  notes: z.string().max(500).optional()
});

const operationalRepassePeriodBaseSchema = z.object({
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data inicial."),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data final.")
});

export const operationalRepassePeriodSchema = operationalRepassePeriodBaseSchema
  .refine((data) => data.periodStart <= data.periodEnd, "A data inicial deve ser anterior ou igual à data final.");

export const confirmOperationalRepasseSchema = operationalRepassePeriodBaseSchema
  .partial()
  .extend({
    payload: z.string().min(20)
  });
