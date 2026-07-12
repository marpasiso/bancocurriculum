import { LgpdRequestType } from "@prisma/client";
import { z } from "zod";

export const dataRequestSchema = z.object({
  type: z.nativeEnum(LgpdRequestType),
  fullName: z.string().min(3),
  email: z.string().email().transform((value) => value.toLowerCase()),
  description: z.string().min(10)
});
