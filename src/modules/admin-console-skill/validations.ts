import { z } from "zod";

export const adminUserRoleSchema = z.enum(["ADMIN", "SUPER_ADMIN"]);

export const adminPaymentFormSchema = z.object({
  employerId: z.string().min(1),
  amountCents: z.number().int().positive(),
  pixCode: z.string().min(3),
  note: z.string().optional()
});

export const adminSubscriptionFormSchema = z.object({
  employerId: z.string().min(1),
  paymentId: z.string().min(1)
});

export const adminPixQrSchema = z.object({
  employerId: z.string().min(1),
  amountCents: z.number().int().positive(),
  pixKey: z.string().min(3),
  receiverName: z.string().min(2).max(25),
  receiverCity: z.string().min(2).max(25),
  description: z.string().min(2).max(72)
});

export const createAdminUserSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
  role: adminUserRoleSchema
});

export const updateAdminUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: adminUserRoleSchema
});

export const blockAdminUserSchema = z.object({
  userId: z.string().min(1)
});

export const unblockAdminUserSchema = blockAdminUserSchema;

export const employerManagementSchema = z.object({
  employerId: z.string().min(1)
});

export const candidateManagementSchema = z.object({
  candidateId: z.string().min(1)
});

export const updateCandidateSchema = z
  .object({
    candidateId: z.string().min(1),
    fullName: z.string().trim().min(3).max(160),
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    phone: z.string().trim().min(8).max(32),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().length(2).transform((value) => value.toUpperCase()),
    desiredRole: z.string().trim().min(2).max(120),
    summary: z.string().trim().min(10),
    experience: z.string().trim().optional().transform((value) => value ?? ""),
    education: z.string().trim().min(3),
    references: z.string().trim().optional().transform((value) => value || undefined)
  })
  .strict("O consentimento LGPD não pode ser alterado manualmente nesta tela.");

export const updateEmployerSchema = z.object({
  employerId: z.string().min(1),
  companyName: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(120),
  document: z.string().trim().min(5).max(32),
  email: z.string().trim().email().transform((value) => value.toLowerCase())
});
