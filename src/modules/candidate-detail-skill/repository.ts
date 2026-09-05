import type { PrismaClient } from "@prisma/client";

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function insertCandidateView(
  tx: Tx,
  input: { employerId: string; candidateId: string; viewedById: string }
) {
  return tx.candidateView.create({ data: input });
}

export async function findCandidateDetails(tx: Tx, input: { candidateId: string; employerId: string }) {
  return tx.candidate.findFirstOrThrow({
    where: {
      id: input.candidateId,
      isActive: true,
      consentAccepted: true,
      OR: [
        { availabilityStatus: "AVAILABLE" },
        {
          reservations: {
            some: {
              employerId: input.employerId,
              status: "ACTIVE"
            }
          }
        }
      ]
    },
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
      reservations: {
        where: {
          employerId: input.employerId,
          status: "ACTIVE"
        },
        take: 1,
        select: {
          id: true,
          jobOpeningId: true,
          status: true
        }
      },
      interestFunctions: {
        select: {
          systemJobFunctionId: true,
          systemJobFunction: { select: { name: true } }
        }
      },
      consentSnapshots: {
        orderBy: { acceptedAt: "desc" },
        take: 1,
        select: { version: true, acceptedAt: true }
      }
    }
  });
}

export async function markCandidateInProcess(
  tx: Tx,
  input: { employerId: string; candidateId: string; actorUserId: string }
) {
  const updated = await tx.candidate.updateMany({
    where: {
      id: input.candidateId,
      isActive: true,
      availabilityStatus: "AVAILABLE",
      consentAccepted: true
    },
    data: { availabilityStatus: "IN_PROCESS" }
  });

  if (updated.count !== 1) {
    throw new Error("Este candidato não está disponível para reserva.");
  }

  await tx.auditLog.create({
    data: {
      userId: input.actorUserId,
      action: "CANDIDATE_PROCESS_STARTED",
      entity: "Candidate",
      entityId: input.candidateId,
      metadata: { employerId: input.employerId, nextStatus: "IN_PROCESS" }
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
