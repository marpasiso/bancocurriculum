import { z } from "zod";

export const passwordSchema = z.string().min(8, "A senha deve ter pelo menos 8 caracteres.");

export const credentialsSchema = z.object({
  email: z.string().trim().max(160, "Informe um e-mail mais curto.").email("Informe um e-mail válido.").transform((value) => value.toLowerCase()),
  password: passwordSchema
});
