import { auditLogSchema } from "./validations";
import { insertAuditLog } from "./repository";
import type { CreateAuditLogInput } from "./types";

export async function recordAuditLog(input: CreateAuditLogInput) {
  const data = auditLogSchema.parse(input) as CreateAuditLogInput;
  return insertAuditLog(data);
}
