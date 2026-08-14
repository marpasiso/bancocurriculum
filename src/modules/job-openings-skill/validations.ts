import { z } from "zod";

const stateSchema = z
  .string()
  .trim()
  .length(2, "Selecione um estado valido.")
  .transform((value) => value.toUpperCase());

export const jobOpeningFormSchema = z.object({
  employerId: z.string().min(1),
  actorUserId: z.string().min(1),
  systemJobFunctionId: z.string().min(1, "Selecione uma funcao valida."),
  title: z.string().trim().min(3, "Informe um titulo para a vaga.").max(120, "O titulo deve ter no maximo 120 caracteres."),
  description: z.string().trim().min(10, "Informe uma descricao para a vaga.").max(1500, "A descricao deve ter no maximo 1500 caracteres."),
  city: z.string().trim().min(2, "Informe a cidade.").max(80, "A cidade deve ter no maximo 80 caracteres."),
  state: stateSchema,
  requirements: z.string().trim().min(3, "Informe os requisitos da vaga.").max(1500, "Os requisitos devem ter no maximo 1500 caracteres."),
  quantity: z.coerce.number().int("Informe uma quantidade valida.").min(1, "Informe ao menos uma vaga.").max(999, "Informe uma quantidade valida.")
});

export const employerJobOpeningSchema = z.object({
  employerId: z.string().min(1),
  actorUserId: z.string().min(1),
  jobOpeningId: z.string().min(1)
});
