import { recordAuditLog } from "@/modules/audit-log-skill/service";
import { dataRequestSchema } from "./validations";
import { insertDataRequest, listDataRequestsForAdmin } from "./repository";

export async function createDataRequest(input: unknown) {
  const data = dataRequestSchema.parse(input);
  const request = await insertDataRequest(data);

  await recordAuditLog({
    action: "LGPD_REQUEST_CREATED",
    entity: "LgpdRequest",
    entityId: request.id,
    metadata: { type: request.type }
  });

  return request;
}

export async function getAdminDataRequests() {
  return listDataRequestsForAdmin();
}
