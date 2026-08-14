import { prisma } from "@/lib/prisma";
import { findSystemJobFunctionById } from "@/modules/job-functions-skill/repository";
import {
  createJobOpeningRecord,
  findEmployerJobOpeningRecord,
  listEmployerJobOpeningRecords,
  listOpenEmployerJobOpeningRecords,
  updateEmployerJobOpeningStatus
} from "./repository";
import { employerJobOpeningSchema, jobOpeningFormSchema } from "./validations";

export async function createEmployerJobOpening(input: unknown) {
  const data = jobOpeningFormSchema.parse(input);
  const systemJobFunction = await findSystemJobFunctionById(data.systemJobFunctionId);

  if (!systemJobFunction || !systemJobFunction.isActive) {
    throw new Error("Selecione uma funcao ativa para a vaga.");
  }

  return prisma.$transaction(async (tx) => {
    const jobOpening = await createJobOpeningRecord(tx, data);

    await tx.auditLog.create({
      data: {
        userId: data.actorUserId,
        action: "JOB_OPENING_CREATED",
        entity: "JobOpening",
        entityId: jobOpening.id,
        metadata: {
          employerId: data.employerId,
          systemJobFunctionId: data.systemJobFunctionId,
          status: "OPEN"
        }
      }
    });

    return jobOpening;
  });
}

export async function listEmployerJobOpenings(input: { employerId: string }) {
  return listEmployerJobOpeningRecords(input.employerId);
}

export async function listOpenEmployerJobOpenings(input: { employerId: string }) {
  return listOpenEmployerJobOpeningRecords(input.employerId);
}

export async function getEmployerJobOpening(input: { employerId: string; jobOpeningId: string }) {
  if (!input.jobOpeningId) return null;
  return findEmployerJobOpeningRecord(input);
}

export async function pauseEmployerJobOpening(input: unknown) {
  return setEmployerJobOpeningStatus(input, "PAUSED", ["OPEN"], "JOB_OPENING_PAUSED");
}

export async function resumeEmployerJobOpening(input: unknown) {
  return setEmployerJobOpeningStatus(input, "OPEN", ["PAUSED"], "JOB_OPENING_RESUMED");
}

export async function closeEmployerJobOpening(input: unknown) {
  return setEmployerJobOpeningStatus(input, "CLOSED", ["OPEN", "PAUSED"], "JOB_OPENING_CLOSED");
}

export async function cancelEmployerJobOpening(input: unknown) {
  return setEmployerJobOpeningStatus(input, "CANCELED", ["OPEN", "PAUSED"], "JOB_OPENING_CANCELED");
}

async function setEmployerJobOpeningStatus(
  input: unknown,
  status: "OPEN" | "PAUSED" | "CLOSED" | "CANCELED",
  allowedCurrentStatuses: Array<"OPEN" | "PAUSED">,
  action: string
) {
  const data = employerJobOpeningSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const jobOpening = await updateEmployerJobOpeningStatus(tx, {
      employerId: data.employerId,
      jobOpeningId: data.jobOpeningId,
      status,
      allowedCurrentStatuses
    });

    await tx.auditLog.create({
      data: {
        userId: data.actorUserId,
        action,
        entity: "JobOpening",
        entityId: jobOpening.id,
        metadata: { employerId: data.employerId, nextStatus: status }
      }
    });

    return jobOpening;
  });
}
