import { prisma } from "@/lib/prisma";
import type { CreateAuditLogInput } from "./types";

export async function insertAuditLog(input: CreateAuditLogInput) {
  return prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      metadata: input.metadata
    }
  });
}
