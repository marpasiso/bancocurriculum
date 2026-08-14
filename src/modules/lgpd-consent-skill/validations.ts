import { z } from "zod";

export const CONSENT_VERSION = "mvp-local-v2";
export const CONSENT_TEXT =
  "Autorizo o uso dos meus dados no banco de currículos para que empregadores com acesso ativo possam consultar meu perfil para oportunidades de trabalho.";

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
