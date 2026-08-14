import { z } from "zod";

export const MANUAL_SUBSCRIPTION_PRICE_CENTS = 9900;

export const manualPaymentSchema = z.object({
  employerId: z.string().min(1),
  amountCents: z.number().int().positive().max(99_999_999, "Informe um valor válido."),
  pixCode: z.string().trim().min(3).max(512, "O código Pix é muito longo."),
  note: z.string().trim().max(1000, "O texto informado ultrapassa o limite permitido.").optional()
});

export const manualPixQrSchema = z.object({
  employerId: z.string().min(1),
  amountCents: z.number().int().positive().max(99_999_999, "Informe um valor válido."),
  pixKey: z.string().trim().min(3, "Informe uma chave Pix válida.").max(120, "Informe uma chave Pix mais curta."),
  receiverName: z.string().trim().min(2, "Informe o nome do recebedor.").max(100, "O nome do recebedor deve ter no máximo 100 caracteres."),
  receiverCity: z.string().trim().min(2, "Informe a cidade do recebedor.").max(80, "A cidade do recebedor deve ter no máximo 80 caracteres."),
  description: z.string().trim().min(2).max(72, "A descrição deve ter no máximo 72 caracteres.")
});

export const confirmManualPixSchema = manualPixQrSchema.extend({
  payload: z.string().trim().min(20).max(512, "O código Pix é muito longo.")
});
