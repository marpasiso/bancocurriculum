import type { PrismaClient } from "@prisma/client";

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function insertCandidateView(
  tx: Tx,
  input: { employerId: string; candidateId: string; viewedById: string }
) {
  return tx.candidateView.create({ data: input });
}

export async function findCandidateDetails(tx: Tx, candidateId: string) {
  return tx.candidate.findUniqueOrThrow({
    where: { id: candidateId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      city: true,
      state: true,
      desiredRole: true,
      summary: true,
      experience: true,
      education: true,
      references: true,
      consentSnapshots: {
        orderBy: { acceptedAt: "desc" },
        take: 1,
        select: { version: true, acceptedAt: true }
      }
    }
  });
}

export async function insertCandidateDetailAuditLog(
  tx: Tx,
  input: { viewedById: string; candidateId: string; candidateViewId: string }
) {
  return tx.auditLog.create({
    data: {
      userId: input.viewedById,
      action: "CANDIDATE_DETAIL_VIEWED",
      entity: "Candidate",
      entityId: input.candidateId,
      metadata: { candidateViewId: input.candidateViewId }
    }
  });
}
