import { z } from "zod";

export const systemJobFunctionIdSchema = z.string().min(1, "Selecione uma função válida.");

export const systemJobFunctionSelectionSchema = z
  .array(systemJobFunctionIdSchema)
  .min(1, "Selecione ao menos uma função de interesse.")
  .max(8, "Selecione no máximo 8 funções de interesse.");

export const systemJobFunctionFormSchema = z.object({
  name: z.string().trim().min(3, "Informe uma função com pelo menos 3 caracteres.").max(58),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().optional()
});

export const updateSystemJobFunctionFormSchema = z.object({
  jobFunctionId: systemJobFunctionIdSchema,
  name: z.string().trim().min(3, "Informe uma função com pelo menos 3 caracteres.").max(58),
  description: z.string().trim().max(500).optional()
});

export const systemJobFunctionStatusSchema = z.object({
  jobFunctionId: systemJobFunctionIdSchema
});
