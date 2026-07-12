import { z } from "zod";

export const passwordSchema = z.string().min(8, "A senha deve ter pelo menos 8 caracteres.");

export const credentialsSchema = z.object({
  email: z.string().email("Informe um e-mail valido.").transform((value) => value.toLowerCase()),
  password: passwordSchema
});
