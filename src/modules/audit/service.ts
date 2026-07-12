import { recordAuditLog } from "@/modules/audit-log-skill/service";
import type { CreateAuditLogInput } from "@/modules/audit-log-skill/types";

export async function auditLog(input: CreateAuditLogInput) {
  await recordAuditLog(input);
}
