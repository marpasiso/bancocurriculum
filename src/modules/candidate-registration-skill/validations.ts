import { z } from "zod";
import { isValidBrazilianStateCode } from "@/lib/brazilian-states";
import { acceptedConsentSchema } from "@/modules/lgpd-consent-skill/validations";
import { systemJobFunctionSelectionSchema } from "@/modules/job-functions-skill/validations";

export const candidateRegistrationSchema = z
  .object({
    fullName: z.string().trim().min(3).max(120, "O nome deve ter no máximo 120 caracteres."),
    email: z.string().trim().max(160, "Informe um e-mail mais curto.").email("Informe um email válido.").transform((value) => value.toLowerCase()),
    phone: z.string().trim().max(15, "Informe um telefone válido.").transform((value) => value.replace(/\D/g, "")).refine((value) => /^\d{10,11}$/.test(value), "Informe um telefone válido."),
    city: z.string().trim().min(2).max(80, "A cidade deve ter no máximo 80 caracteres."),
    state: z
      .string()
      .trim()
      .max(2, "Selecione um estado válido.")
      .transform((value) => value.toUpperCase())
      .refine(isValidBrazilianStateCode, "Selecione um estado válido."),
    systemJobFunctionIds: systemJobFunctionSelectionSchema,
    summary: z.string().trim().min(10, "Informe um resumo profissional com pelo menos 10 caracteres.").max(800, "O texto informado ultrapassa o limite permitido."),
    experience: z
      .string()
      .trim()
      .max(1500, "O texto informado ultrapassa o limite permitido.")
      .optional()
      .transform((value) => value ?? "")
      .refine(
        (value) => value.length === 0 || value.length >= 10,
        "Informe uma experiência com pelo menos 10 caracteres ou deixe o campo em branco."
      ),
    education: z.string().trim().min(3, "Informe sua formação.").max(800, "O texto informado ultrapassa o limite permitido."),
    references: z.string().trim().max(1000, "O texto informado ultrapassa o limite permitido.").optional(),
    acceptedLgpd: acceptedConsentSchema
  })
  .strict("Upload de currículo, PDF, imagem ou documento não é permitido.");
