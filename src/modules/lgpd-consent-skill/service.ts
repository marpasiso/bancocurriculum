import { consentSnapshotSchema, CONSENT_TEXT, CONSENT_VERSION } from "./validations";
import { insertConsentSnapshot } from "./repository";

export { CONSENT_TEXT, CONSENT_VERSION };

export async function saveConsentSnapshot(input: {
  candidateId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const data = consentSnapshotSchema.parse({
    candidateId: input.candidateId,
    version: CONSENT_VERSION,
    text: CONSENT_TEXT,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent
  });

  return insertConsentSnapshot(data);
}
