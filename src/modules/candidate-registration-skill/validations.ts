import { z } from "zod";
import { acceptedConsentSchema } from "@/modules/lgpd-consent-skill/validations";
import { systemJobFunctionSelectionSchema } from "@/modules/job-functions-skill/validations";

export const candidateRegistrationSchema = z
  .object({
    fullName: z.string().min(3),
    email: z.string().email().transform((value) => value.toLowerCase()),
    phone: z.string().min(8),
    city: z.string().min(2),
    state: z.string().length(2).transform((value) => value.toUpperCase()),
    systemJobFunctionIds: systemJobFunctionSelectionSchema,
    summary: z.string().min(10, "Informe um resumo profissional com pelo menos 10 caracteres."),
    experience: z
      .string()
      .trim()
      .optional()
      .transform((value) => value ?? "")
      .refine(
        (value) => value.length === 0 || value.length >= 10,
        "Informe uma experiência com pelo menos 10 caracteres ou deixe o campo em branco."
      ),
    education: z.string().min(3, "Informe sua formação."),
    references: z.string().optional(),
    acceptedLgpd: acceptedConsentSchema
  })
  .strict("Upload de currículo, PDF, imagem ou documento não é permitido neste MVP.");
