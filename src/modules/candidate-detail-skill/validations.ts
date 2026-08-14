import { z } from "zod";

export const candidateDetailSchema = z.object({
  employerId: z.string().min(1),
  candidateId: z.string().min(1),
  viewedById: z.string().min(1),
  jobOpeningId: z.string().min(1, "Selecione uma vaga aberta para reservar o candidato.").optional()
});
