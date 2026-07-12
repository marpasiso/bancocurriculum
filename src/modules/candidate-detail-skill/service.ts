import { prisma } from "@/lib/prisma";
import { ensureEmployerCanAccessCandidates } from "@/modules/subscription-gate-skill/service";
import { candidateDetailSchema } from "./validations";
import { findCandidateDetails, insertCandidateDetailAuditLog, insertCandidateView } from "./repository";

export async function getCandidateDetailsForEmployer(input: unknown) {
  const data = candidateDetailSchema.parse(input);
  await ensureEmployerCanAccessCandidates(data.employerId);

  return prisma.$transaction(async (tx) => {
    const view = await insertCandidateView(tx, data);
    const candidate = await findCandidateDetails(tx, data.candidateId);

    await insertCandidateDetailAuditLog(tx, {
      viewedById: data.viewedById,
      candidateId: data.candidateId,
      candidateViewId: view.id
    });

    return candidate;
  });
}
