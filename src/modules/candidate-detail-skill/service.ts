import { prisma } from "@/lib/prisma";
import { reserveCandidateForJobOpening } from "@/modules/candidate-reservation-skill/service";
import { ensureEmployerCanAccessCandidates } from "@/modules/subscription-gate-skill/service";
import { candidateDetailSchema } from "./validations";
import { findCandidateDetails, insertCandidateDetailAuditLog, insertCandidateView } from "./repository";

export async function getCandidateDetailsForEmployer(input: unknown) {
  const data = candidateDetailSchema.parse(input);
  await ensureEmployerCanAccessCandidates(data.employerId);

  return prisma.$transaction(async (tx) => {
    const candidate = await findCandidateDetails(tx, data.candidateId);
    const view = await insertCandidateView(tx, data);

    await insertCandidateDetailAuditLog(tx, {
      viewedById: data.viewedById,
      candidateId: data.candidateId,
      candidateViewId: view.id
    });

    return candidate;
  });
}

export async function startCandidateProcessForEmployer(input: unknown) {
  const data = candidateDetailSchema.parse(input);
  return reserveCandidateForJobOpening({
    employerId: data.employerId,
    actorUserId: data.viewedById,
    candidateId: data.candidateId,
    jobOpeningId: data.jobOpeningId
  });
}
