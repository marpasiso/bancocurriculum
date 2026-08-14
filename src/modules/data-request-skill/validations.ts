import { LgpdRequestType } from "@prisma/client";
import { z } from "zod";

const publicDataRequestTypes = [
  LgpdRequestType.CORRECTION,
  LgpdRequestType.DELETE_REVIEW,
  LgpdRequestType.REVOCATION
] as const;

export const dataRequestSchema = z.object({
  type: z.enum(publicDataRequestTypes, {
    errorMap: () => ({ message: "Selecione o tipo de solicitação." })
  }),
  fullName: z.string().trim().min(3, "Informe o nome completo.").max(120, "O nome deve ter no máximo 120 caracteres."),
  email: z.string().trim().max(160, "Informe um e-mail mais curto.").email("Informe um e-mail válido.").transform((value) => value.toLowerCase()),
  description: z.string().trim().min(20, "Descreva a solicitação com pelo menos 20 caracteres.").max(1000, "Use até 1000 caracteres.")
});
