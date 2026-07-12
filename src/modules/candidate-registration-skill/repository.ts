import { prisma } from "@/lib/prisma";
import type { CandidateConsentMetadata, CandidateRegistrationInput } from "./types";

export async function insertCandidate(
  input: CandidateRegistrationInput,
  jobFunctions: { id: string; name: string }[],
  consent: CandidateConsentMetadata
) {
  return prisma.candidate.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      city: input.city,
      state: input.state,
      desiredRole: jobFunctions.map((jobFunction) => jobFunction.name).join(", "),
      summary: input.summary,
      experience: input.experience,
      education: input.education,
      references: input.references,
      consentAccepted: consent.consentAccepted,
      consentAcceptedAt: consent.consentAcceptedAt,
      consentTextVersion: consent.consentTextVersion,
      consentTextSnapshot: consent.consentTextSnapshot,
      consentIp: consent.consentIp,
      consentUserAgent: consent.consentUserAgent,
      interestFunctions: {
        create: jobFunctions.map((jobFunction) => ({
          systemJobFunctionId: jobFunction.id
        }))
      }
    },
    select: { id: true }
  });
}
