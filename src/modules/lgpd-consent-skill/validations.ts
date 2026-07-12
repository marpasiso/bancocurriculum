import { z } from "zod";

export const CONSENT_VERSION = "mvp-local-v1";
export const CONSENT_TEXT =
  "Autorizo o tratamento dos meus dados pessoais para participação no banco de currículos, incluindo o compartilhamento controlado com empregadores assinantes, exclusivamente para fins de oportunidade de trabalho.";

export const acceptedConsentSchema = z.literal(true, {
  errorMap: () => ({ message: "É necessário autorizar o tratamento dos dados para concluir o cadastro." })
});

export const consentSnapshotSchema = z.object({
  candidateId: z.string().min(1),
  version: z.string().min(1),
  text: z.string().min(10),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});
