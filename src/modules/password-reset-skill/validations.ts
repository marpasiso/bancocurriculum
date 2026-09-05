import { z } from "zod";
import { passwordSchema } from "@/modules/security-skill/validations";

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .max(160, "Informe um e-mail mais curto.")
    .email("Informe um e-mail válido.")
    .transform((value) => value.toLowerCase())
});

export const passwordResetConfirmSchema = z
  .object({
    token: z.string().trim().min(32, "Link inválido ou expirado."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas informadas não conferem.",
    path: ["confirmPassword"]
  });
