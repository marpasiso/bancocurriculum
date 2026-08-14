import { z } from "zod";

export const auditLogSchema = z.object({
  userId: z.string().optional(),
  action: z.string().min(2),
  entity: z.string().min(2),
  entityId: z.string().optional(),
  metadata: z.unknown().optional()
});
