import { registerCandidate } from "@/modules/candidate-registration-skill/service";
import {
  CONSENT_TEXT,
  CONSENT_VERSION
} from "@/modules/lgpd-consent-skill/service";
import { searchCandidatesForEmployer } from "@/modules/candidate-search-skill/service";
import { getCandidateDetailsForEmployer } from "@/modules/candidate-detail-skill/service";

export { CONSENT_TEXT, CONSENT_VERSION };

export async function createCandidate(input: unknown, request?: { ipAddress?: string; userAgent?: string }) {
  return registerCandidate(input, request);
}

export async function searchCandidates(employerId: string, query = "") {
  return searchCandidatesForEmployer({ employerId, query });
}

export async function getCandidateDetails(input: { employerId: string; candidateId: string; viewedById: string }) {
  return getCandidateDetailsForEmployer(input);
}
