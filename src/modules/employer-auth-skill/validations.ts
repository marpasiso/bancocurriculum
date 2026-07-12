import { z } from "zod";
import { credentialsSchema } from "@/modules/security-skill/validations";

export const employerRegistrationSchema = credentialsSchema.extend({
  companyName: z.string().min(2, "Informe a empresa."),
  contactName: z.string().min(2, "Informe o responsavel."),
  document: z.string().min(5, "Informe o documento.")
});

export const loginSchema = credentialsSchema;

export const employerAccountUpdateSchema = z.object({
  userId: z.string().min(1),
  employerId: z.string().min(1),
  email: z.string().email("Informe um e-mail válido.").transform((value) => value.toLowerCase()),
  companyName: z.string().min(2, "Informe a empresa."),
  contactName: z.string().min(2, "Informe o responsável."),
  document: z.string().min(5, "Informe o documento.")
});

export const employerPasswordChangeSchema = z.object({
  userId: z.string().min(1),
  currentPassword: z.string().min(1, "Informe a senha atual."),
  newPassword: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres.")
});
