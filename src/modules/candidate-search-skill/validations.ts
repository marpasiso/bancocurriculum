import { z } from "zod";

export const candidateSearchSchema = z.object({
  employerId: z.string().min(1),
  query: z.string().optional().default(""),
  role: z.string().optional().default(""),
  city: z.string().optional().default("")
});
