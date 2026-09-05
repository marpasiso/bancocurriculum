import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ensureEmployerCanAccessCandidates } from "@/modules/subscription-gate-skill/service";
import {
  adminCandidateReservationSchema,
  adminReservationSchema,
  reserveCandidateForJobOpeningSchema
} from "./validations";

export async function reserveCandidateForJobOpening(input: unknown) {
  const data = reserveCandidateForJobOpeningSchema.parse(input);
  await ensureEmployerCanAccessCandidates(data.employerId);

  return prisma.$transaction(async (tx) => {
    const jobOpening = await tx.jobOpening.findFirst({
      where: {
        id: data.jobOpeningId,
        employerId: data.employerId,
        status: "OPEN"
      },
      select: { id: true, quantity: true, systemJobFunctionId: true }
    });

    if (!jobOpening) {
      throw new Error("Vaga aberta nao encontrada para este empregador.");
    }

    const activeJobReservationCount = await tx.candidateReservation.count({
      where: {
        jobOpeningId: data.jobOpeningId,
        status: "ACTIVE"
      }
    });

    if (activeJobReservationCount >= jobOpening.quantity) {
      throw new Error("Esta vaga ja atingiu a quantidade de reservas permitida.");
    }

    const activeReservation = await tx.candidateReservation.findFirst({
      where: {
        candidateId: data.candidateId,
        status: "ACTIVE"
      },
      select: { id: true }
    });

    if (activeReservation) {
      throw new Error("Este candidato ja esta reservado.");
    }

    const candidateMatchesJobOpening = await tx.candidateInterestFunction.findFirst({
      where: {
        candidateId: data.candidateId,
        systemJobFunctionId: jobOpening.systemJobFunctionId
      },
      select: { id: true }
    });

    if (!candidateMatchesJobOpening) {
      throw new Error("Este candidato não possui interesse compatível com a vaga selecionada.");
    }

    const updatedCandidate = await tx.candidate.updateMany({
      where: {
        id: data.candidateId,
        isActive: true,
        availabilityStatus: "AVAILABLE",
        consentAccepted: true
      },
      data: { availabilityStatus: "IN_PROCESS" }
    });

    if (updatedCandidate.count !== 1) {
      throw new Error("Este candidato nao esta disponivel para reserva.");
    }

    const reservation = await tx.candidateReservation.create({
      data: {
        candidateId: data.candidateId,
        employerId: data.employerId,
        jobOpeningId: data.jobOpeningId,
        createdById: data.actorUserId,
        status: "ACTIVE"
      }
    });

    await tx.auditLog.create({
      data: {
        userId: data.actorUserId,
        action: "CANDIDATE_RESERVED_FOR_JOB_OPENING",
        entity: "CandidateReservation",
        entityId: reservation.id,
        metadata: {
          candidateId: data.candidateId,
          employerId: data.employerId,
          jobOpeningId: data.jobOpeningId,
          nextStatus: "ACTIVE",
          candidateNextStatus: "IN_PROCESS"
        }
      }
    });

    await tx.auditLog.create({
      data: {
        userId: data.actorUserId,
        action: "CANDIDATE_RESERVED_FOR_JOB_OPENING",
        entity: "Candidate",
        entityId: data.candidateId,
        metadata: {
          reservationId: reservation.id,
          employerId: data.employerId,
          jobOpeningId: data.jobOpeningId,
          nextStatus: "IN_PROCESS"
        }
      }
    });

    return reservation;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function hasActiveCandidateReservation(candidateId: string) {
  const reservation = await prisma.candidateReservation.findFirst({
    where: { candidateId, status: "ACTIVE" },
    select: { id: true }
  });

  return Boolean(reservation);
}

export async function cancelCandidateReservationByAdmin(input: unknown) {
  const data = adminReservationSchema.parse(input);
  return cancelCandidateReservationByAdminData(data);
}

export async function cancelActiveCandidateReservationByCandidateForAdmin(input: unknown) {
  const data = adminCandidateReservationSchema.parse(input);
  const reservation = await prisma.candidateReservation.findFirst({
    where: { candidateId: data.candidateId, status: "ACTIVE" },
    select: { id: true }
  });

  if (!reservation) {
    throw new Error("Reserva ativa nao encontrada para este candidato.");
  }

  return cancelCandidateReservationByAdminData({
    adminUserId: data.adminUserId,
    reservationId: reservation.id
  });
}

async function cancelCandidateReservationByAdminData(data: { adminUserId: string; reservationId: string }) {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.candidateReservation.findFirst({
      where: { id: data.reservationId, status: "ACTIVE" },
      select: {
        id: true,
        candidateId: true,
        employerId: true,
        jobOpeningId: true,
        status: true,
        candidate: { select: { isActive: true, availabilityStatus: true } }
      }
    });

    if (!reservation) {
      throw new Error("Reserva ativa nao encontrada.");
    }

    if (!reservation.candidate.isActive || reservation.candidate.availabilityStatus === "HIRED") {
      throw new Error("Candidato contratado ou desativado nao pode voltar automaticamente para disponivel.");
    }

    const updatedReservation = await tx.candidateReservation.update({
      where: { id: reservation.id },
      data: { status: "CANCELED", canceledAt: new Date() }
    });

    await tx.candidate.update({
      where: { id: reservation.candidateId },
      data: { availabilityStatus: "AVAILABLE" }
    });

    await tx.auditLog.create({
      data: {
        userId: data.adminUserId,
        action: "CANDIDATE_RESERVATION_CANCELED",
        entity: "CandidateReservation",
        entityId: reservation.id,
        metadata: {
          candidateId: reservation.candidateId,
          employerId: reservation.employerId,
          jobOpeningId: reservation.jobOpeningId,
          previousStatus: reservation.status,
          nextStatus: "CANCELED",
          candidateNextStatus: "AVAILABLE"
        }
      }
    });

    await tx.auditLog.create({
      data: {
        userId: data.adminUserId,
        action: "CANDIDATE_RESERVATION_CANCELED",
        entity: "Candidate",
        entityId: reservation.candidateId,
        metadata: {
          reservationId: reservation.id,
          employerId: reservation.employerId,
          jobOpeningId: reservation.jobOpeningId,
          nextStatus: "AVAILABLE"
        }
      }
    });

    return updatedReservation;
  });
}

export async function confirmCandidateReservationHiringByAdmin(input: unknown) {
  const data = adminReservationSchema.parse(input);
  return confirmCandidateReservationHiringByAdminData(data);
}

export async function confirmActiveCandidateReservationHiringByCandidateForAdmin(input: unknown) {
  const data = adminCandidateReservationSchema.parse(input);
  const reservation = await prisma.candidateReservation.findFirst({
    where: { candidateId: data.candidateId, status: "ACTIVE" },
    select: { id: true }
  });

  if (!reservation) {
    throw new Error("Reserva ativa nao encontrada para este candidato.");
  }

  return confirmCandidateReservationHiringByAdminData({
    adminUserId: data.adminUserId,
    reservationId: reservation.id
  });
}

async function confirmCandidateReservationHiringByAdminData(data: { adminUserId: string; reservationId: string }) {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.candidateReservation.findFirst({
      where: { id: data.reservationId, status: "ACTIVE" },
      select: {
        id: true,
        candidateId: true,
        employerId: true,
        jobOpeningId: true,
        status: true,
        candidate: { select: { isActive: true, availabilityStatus: true } }
      }
    });

    if (!reservation) {
      throw new Error("Reserva ativa nao encontrada.");
    }

    if (!reservation.candidate.isActive || reservation.candidate.availabilityStatus !== "IN_PROCESS") {
      throw new Error("A contratacao so pode ser confirmada para candidato reservado e ativo.");
    }

    const updatedReservation = await tx.candidateReservation.update({
      where: { id: reservation.id },
      data: { status: "HIRED", hiredAt: new Date() }
    });

    await tx.candidate.update({
      where: { id: reservation.candidateId },
      data: { availabilityStatus: "HIRED", isActive: false }
    });

    await tx.auditLog.create({
      data: {
        userId: data.adminUserId,
        action: "CANDIDATE_RESERVATION_HIRING_CONFIRMED",
        entity: "CandidateReservation",
        entityId: reservation.id,
        metadata: {
          candidateId: reservation.candidateId,
          employerId: reservation.employerId,
          jobOpeningId: reservation.jobOpeningId,
          previousStatus: reservation.status,
          nextStatus: "HIRED",
          candidateNextStatus: "HIRED"
        }
      }
    });

    await tx.auditLog.create({
      data: {
        userId: data.adminUserId,
        action: "CANDIDATE_RESERVATION_HIRING_CONFIRMED",
        entity: "Candidate",
        entityId: reservation.candidateId,
        metadata: {
          reservationId: reservation.id,
          employerId: reservation.employerId,
          jobOpeningId: reservation.jobOpeningId,
          nextStatus: "HIRED"
        }
      }
    });

    return updatedReservation;
  });
}

export async function listEmployerCandidateReservations(employerId: string) {
  return prisma.candidateReservation.findMany({
    where: {
      employerId
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      canceledAt: true,
      hiredAt: true,
      candidate: {
        select: {
          id: true,
          fullName: true,
          city: true,
          state: true,
          availabilityStatus: true
        }
      },
      jobOpening: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function cancelCandidateReservationByEmployer(input: {
  employerId: string;
  actorUserId: string;
  reservationId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.candidateReservation.findFirst({
      where: {
        id: input.reservationId,
        employerId: input.employerId,
        status: "ACTIVE"
      },
      select: {
        id: true,
        candidateId: true,
        employerId: true,
        jobOpeningId: true,
        status: true,
        candidate: {
          select: {
            isActive: true,
            availabilityStatus: true
          }
        }
      }
    });

    if (!reservation) {
      throw new Error("Reserva ativa nao encontrada para este empregador.");
    }

    if (!reservation.candidate.isActive || reservation.candidate.availabilityStatus === "HIRED") {
      throw new Error("Candidato contratado ou desativado nao pode voltar automaticamente para disponivel.");
    }

    const updatedReservation = await tx.candidateReservation.update({
      where: {
        id: reservation.id
      },
      data: {
        status: "CANCELED",
        canceledAt: new Date()
      }
    });

    await tx.candidate.update({
      where: {
        id: reservation.candidateId
      },
      data: {
        availabilityStatus: "AVAILABLE"
      }
    });

    await tx.auditLog.create({
      data: {
        userId: input.actorUserId,
        action: "EMPLOYER_CANDIDATE_RESERVATION_CANCELED",
        entity: "CandidateReservation",
        entityId: reservation.id,
        metadata: {
          candidateId: reservation.candidateId,
          employerId: reservation.employerId,
          jobOpeningId: reservation.jobOpeningId,
          previousStatus: reservation.status,
          nextStatus: "CANCELED",
          candidateNextStatus: "AVAILABLE"
        }
      }
    });

    return updatedReservation;
  });
}