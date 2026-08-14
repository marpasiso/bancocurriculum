import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function createJobOpeningRecord(
  tx: Tx,
  input: {
    employerId: string;
    systemJobFunctionId: string;
    title: string;
    description: string;
    city: string;
    state: string;
    requirements: string;
    quantity: number;
  }
) {
  return tx.jobOpening.create({
    data: {
      employerId: input.employerId,
      systemJobFunctionId: input.systemJobFunctionId,
      title: input.title,
      description: input.description,
      city: input.city,
      state: input.state,
      requirements: input.requirements,
      quantity: input.quantity,
      status: "OPEN"
    }
  });
}

export async function listEmployerJobOpeningRecords(employerId: string) {
  return prisma.jobOpening.findMany({
    where: { employerId },
    include: {
      systemJobFunction: { select: { id: true, name: true } },
      _count: { select: { reservations: { where: { status: "ACTIVE" } } } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function listOpenEmployerJobOpeningRecords(employerId: string) {
  return prisma.jobOpening.findMany({
    where: { employerId, status: "OPEN" },
    include: {
      systemJobFunction: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function findEmployerJobOpeningRecord(input: {
  employerId: string;
  jobOpeningId: string;
}) {
  return prisma.jobOpening.findFirst({
    where: {
      id: input.jobOpeningId,
      employerId: input.employerId
    },
    include: {
      systemJobFunction: { select: { id: true, name: true } },
      _count: { select: { reservations: { where: { status: "ACTIVE" } } } }
    }
  });
}

export async function updateEmployerJobOpeningStatus(
  tx: Tx,
  input: {
    employerId: string;
    jobOpeningId: string;
    status: "OPEN" | "PAUSED" | "CLOSED" | "CANCELED";
    allowedCurrentStatuses: Array<"OPEN" | "PAUSED">;
  }
) {
  const updated = await tx.jobOpening.updateMany({
    where: {
      id: input.jobOpeningId,
      employerId: input.employerId,
      status: { in: input.allowedCurrentStatuses }
    },
    data: { status: input.status }
  });

  if (updated.count !== 1) {
    throw new Error("Vaga não encontrada ou sem alteração permitida.");
  }

  return tx.jobOpening.findFirstOrThrow({
    where: { id: input.jobOpeningId, employerId: input.employerId }
  });
}
