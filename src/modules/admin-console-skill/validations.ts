import { z } from "zod";
import { isValidBrazilianStateCode } from "@/lib/brazilian-states";
import { isBrazilianDocumentType, normalizeBrazilianDocument } from "@/lib/input-masks";

export const adminUserRoleSchema = z.enum(["ADMIN", "SUPER_ADMIN"]);

export const adminPaymentFormSchema = z.object({
  employerId: z.string().min(1),
  amountCents: z.number().int().positive().max(99_999_999, "Informe um valor vÃ¡lido."),
  pixCode: z.string().trim().min(3).max(512, "O cÃ³digo Pix Ã© muito longo."),
  note: z.string().trim().max(1000, "O texto informado ultrapassa o limite permitido.").optional()
});

export const adminSubscriptionFormSchema = z.object({
  employerId: z.string().min(1),
  paymentId: z.string().min(1)
});

export const adminPixQrSchema = z.object({
  employerId: z.string().min(1),
  amountCents: z.number().int().positive().max(99_999_999, "Informe um valor vÃ¡lido."),
  pixKey: z.string().trim().min(3, "Informe uma chave Pix vÃ¡lida.").max(120, "Informe uma chave Pix mais curta."),
  receiverName: z.string().trim().min(2, "Informe o nome do recebedor.").max(100, "O nome do recebedor deve ter no máximo 100 caracteres."),
  receiverCity: z.string().trim().min(2, "Informe a cidade do recebedor.").max(80, "A cidade do recebedor deve ter no máximo 80 caracteres."),
  description: z.string().trim().min(2).max(72, "A descriÃ§Ã£o deve ter no mÃ¡ximo 72 caracteres.")
});

export const adminPixConfirmationSchema = z.object({
  employerId: z.string().min(1),
  description: z.string().trim().min(2).max(72, "A descriÃ§Ã£o deve ter no mÃ¡ximo 72 caracteres."),
  payload: z.string().trim().min(20).max(512, "O cÃ³digo Pix Ã© muito longo.")
});

export const createAdminUserSchema = z.object({
  email: z.string().trim().max(160, "Informe um e-mail mais curto.").email("Informe um e-mail vÃ¡lido.").transform((value) => value.toLowerCase()),
  password: z.string().min(8),
  role: adminUserRoleSchema
});

export const updateAdminUserRoleSchema = z.object({ userId: z.string().min(1), role: adminUserRoleSchema });
export const blockAdminUserSchema = z.object({ userId: z.string().min(1) });
export const unblockAdminUserSchema = blockAdminUserSchema;
export const employerManagementSchema = z.object({ employerId: z.string().min(1) });
export const candidateManagementSchema = z.object({ candidateId: z.string().min(1) });

const phoneSchema = z.string().trim().max(15, "Informe um telefone vÃ¡lido.").transform((value) => value.replace(/\D/g, "")).refine((value) => /^\d{10,11}$/.test(value), "Informe um telefone vÃ¡lido.");

export const updateCandidateSchema = z
  .object({
    candidateId: z.string().min(1),
    fullName: z.string().trim().min(3).max(120, "O nome deve ter no mÃ¡ximo 120 caracteres."),
    email: z.string().trim().max(160, "Informe um e-mail mais curto.").email("Informe um e-mail vÃ¡lido.").transform((value) => value.toLowerCase()),
    phone: phoneSchema,
    city: z.string().trim().min(2).max(80, "A cidade deve ter no mÃ¡ximo 80 caracteres."),
    state: z.string().trim().max(2, "Selecione um estado vÃ¡lido.").transform((value) => value.toUpperCase()).refine(isValidBrazilianStateCode, "Selecione um estado vÃ¡lido."),
    desiredRole: z.string().trim().min(2).max(120, "O cargo deve ter no mÃ¡ximo 120 caracteres."),
    summary: z.string().trim().min(10).max(800, "O texto informado ultrapassa o limite permitido."),
    experience: z.string().trim().max(1500, "O texto informado ultrapassa o limite permitido.").optional().transform((value) => value ?? ""),
    education: z.string().trim().min(3).max(800, "O texto informado ultrapassa o limite permitido."),
    references: z.string().trim().max(1000, "O texto informado ultrapassa o limite permitido.").optional().transform((value) => value || undefined)
  })
  .strict("A autorizaÃ§Ã£o de uso dos dados nÃ£o pode ser alterada manualmente nesta tela.");

export const updateEmployerSchema = z.object({
  employerId: z.string().min(1),
  companyName: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(120),
  documentType: z.enum(["CPF", "CNPJ"], { errorMap: () => ({ message: "Selecione o tipo de documento." }) }),
  document: z.string().trim().max(18, "Informe um documento vÃ¡lido.").transform(normalizeBrazilianDocument),
  email: z.string().trim().max(160).email("Informe um e-mail vÃ¡lido.").transform((value) => value.toLowerCase())
}).superRefine((input, context) => {
  if (!isBrazilianDocumentType(input.document, input.documentType)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: input.documentType === "CPF" ? "Informe um CPF vÃ¡lido." : "Informe um CNPJ vÃ¡lido.",
      path: ["document"]
    });
  }
});

