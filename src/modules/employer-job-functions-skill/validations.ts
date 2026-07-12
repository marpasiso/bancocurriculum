import { z } from "zod";

export const jobFunctionIdSchema = z.object({
  jobFunctionId: z.string().min(1)
});

export const jobFunctionFormSchema = z.object({
  name: z.string().trim().min(2).max(58),
  description: z.string().trim().max(500).optional()
});

export const updateJobFunctionFormSchema = jobFunctionIdSchema.merge(jobFunctionFormSchema);

export const candidateJobFunctionSelectionSchema = z
  .array(z.string().min(1))
  .min(1, "Selecione ao menos uma funcao de interesse.")
  .max(5, "Selecione no maximo 5 funcoes de interesse.");
