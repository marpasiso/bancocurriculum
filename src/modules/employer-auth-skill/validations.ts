import { z } from "zod";
import { isBrazilianDocumentType, normalizeBrazilianDocument } from "@/lib/input-masks";
import { credentialsSchema } from "@/modules/security-skill/validations";

const documentTypeSchema = z.enum(["CPF", "CNPJ"], {
  errorMap: () => ({ message: "Selecione o tipo de documento." })
});

function validateEmployerDocument(input: { document: string; documentType: "CPF" | "CNPJ" }, context: z.RefinementCtx) {
  if (!isBrazilianDocumentType(input.document, input.documentType)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: input.documentType === "CPF" ? "Informe um CPF válido." : "Informe um CNPJ válido.",
      path: ["document"]
    });
  }
}

const documentFields = {
  documentType: documentTypeSchema,
  document: z.string().trim().max(18, "Informe um documento válido.").transform(normalizeBrazilianDocument)
};

export const employerRegistrationSchema = credentialsSchema
  .extend({
    companyName: z.string().trim().min(2, "Informe a empresa.").max(120, "O nome deve ter no máximo 120 caracteres."),
    contactName: z.string().trim().min(2, "Informe o responsável.").max(120, "O nome deve ter no máximo 120 caracteres."),
    ...documentFields
  })
  .superRefine(validateEmployerDocument);

export const loginSchema = z.object({
  email: z.string().trim().max(160, "Informe um e-mail mais curto.").email("Informe um e-mail válido.").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Informe a senha.")
});

export const employerAccountUpdateSchema = z
  .object({
    userId: z.string().min(1),
    employerId: z.string().min(1),
    email: z.string().trim().max(160, "Informe um e-mail mais curto.").email("Informe um e-mail válido.").transform((value) => value.toLowerCase()),
    companyName: z.string().trim().min(2, "Informe a empresa.").max(120, "O nome deve ter no máximo 120 caracteres."),
    contactName: z.string().trim().min(2, "Informe o responsável.").max(120, "O nome deve ter no máximo 120 caracteres."),
    ...documentFields
  })
  .superRefine(validateEmployerDocument);

export const employerPasswordChangeSchema = z.object({
  userId: z.string().min(1),
  currentPassword: z.string().min(1, "Informe a senha atual."),
  newPassword: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres.")
});
