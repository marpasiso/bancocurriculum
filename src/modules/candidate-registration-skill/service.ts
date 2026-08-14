import { recordAuditLog } from "@/modules/audit-log-skill/service";
import { validateActiveSystemJobFunctions } from "@/modules/job-functions-skill/service";
import { saveConsentSnapshot, CONSENT_TEXT, CONSENT_VERSION } from "@/modules/lgpd-consent-skill/service";
import { insertCandidate } from "./repository";
import { candidateRegistrationSchema } from "./validations";
import type { RequestMetadata } from "./types";

export async function registerCandidate(input: unknown, request?: RequestMetadata) {
  const data = candidateRegistrationSchema.parse(input);
  const jobFunctions = await validateActiveSystemJobFunctions(data.systemJobFunctionIds);
  const consentAcceptedAt = new Date();
  const candidate = await insertCandidate(data, jobFunctions, {
    consentAccepted: true,
    consentAcceptedAt,
    consentTextVersion: CONSENT_VERSION,
    consentTextSnapshot: CONSENT_TEXT,
    consentIp: request?.ipAddress,
    consentUserAgent: request?.userAgent
  });

  await saveConsentSnapshot({
    candidateId: candidate.id,
    ipAddress: request?.ipAddress,
    userAgent: request?.userAgent
  });

  await recordAuditLog({
    action: "CANDIDATE_REGISTERED_WITH_CONSENT",
    entity: "Candidate",
    entityId: candidate.id,
    metadata: { consentVersion: CONSENT_VERSION, systemJobFunctionIds: jobFunctions.map((jobFunction) => jobFunction.id) }
  });

  return candidate;
}
