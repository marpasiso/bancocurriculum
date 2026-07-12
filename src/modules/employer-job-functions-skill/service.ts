import { recordAuditLog } from "@/modules/audit-log-skill/service";
import {
  candidateJobFunctionSelectionSchema,
  jobFunctionFormSchema,
  jobFunctionIdSchema,
  updateJobFunctionFormSchema
} from "./validations";
import {
  findActiveJobFunctionsByIds,
  findJobFunctionByEmployerAndName,
  findJobFunctionById,
  insertJobFunction,
  listActiveJobFunctionsForPublicRegistration,
  listJobFunctionsByEmployer,
  listJobFunctionsForAdminModeration,
  setJobFunctionActive,
  updateJobFunction
} from "./repository";

function normalizeJobFunctionName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export async function getPublicActiveJobFunctions() {
  return listActiveJobFunctionsForPublicRegistration();
}

export async function getEmployerJobFunctions(employerId: string) {
  return listJobFunctionsByEmployer(employerId);
}

export async function getAdminJobFunctionsForModeration() {
  return listJobFunctionsForAdminModeration();
}

export async function validateActiveCandidateJobFunctions(input: unknown) {
  const jobFunctionIds = candidateJobFunctionSelectionSchema.parse(input);
  const uniqueIds = [...new Set(jobFunctionIds)];
  const functions = await findActiveJobFunctionsByIds(uniqueIds);

  if (functions.length !== uniqueIds.length) {
    throw new Error("Uma ou mais funcoes selecionadas nao existem ou estao inativas.");
  }

  return functions;
}

async function requireOwnedJobFunction(employerId: string, jobFunctionId: string) {
  const jobFunction = await findJobFunctionById(jobFunctionId);

  if (!jobFunction || jobFunction.employerId !== employerId) {
    throw new Error("Funcao nao encontrada para este empregador.");
  }

  return jobFunction;
}

export async function createEmployerJobFunction(actorUserId: string, employerId: string, input: unknown) {
  const parsed = jobFunctionFormSchema.parse(input);
  const data = { ...parsed, name: normalizeJobFunctionName(parsed.name) };
  const existing = await findJobFunctionByEmployerAndName(employerId, data.name);

  if (existing) {
    throw new Error("Esta função já está cadastrada para este empregador.");
  }

  const jobFunction = await insertJobFunction({ employerId, ...data });

  await recordAuditLog({
    userId: actorUserId,
    action: "JOB_FUNCTION_CREATED",
    entity: "JobFunction",
    entityId: jobFunction.id,
    metadata: { employerId, name: jobFunction.name }
  });

  return jobFunction;
}

export async function updateEmployerJobFunction(actorUserId: string, employerId: string, input: unknown) {
  const parsed = updateJobFunctionFormSchema.parse(input);
  const data = { ...parsed, name: normalizeJobFunctionName(parsed.name) };
  await requireOwnedJobFunction(employerId, data.jobFunctionId);
  const existing = await findJobFunctionByEmployerAndName(employerId, data.name);

  if (existing && existing.id !== data.jobFunctionId) {
    throw new Error("Esta função já está cadastrada para este empregador.");
  }

  const jobFunction = await updateJobFunction(data);

  await recordAuditLog({
    userId: actorUserId,
    action: "JOB_FUNCTION_UPDATED",
    entity: "JobFunction",
    entityId: jobFunction.id,
    metadata: { employerId, name: jobFunction.name }
  });

  return jobFunction;
}

export async function activateEmployerJobFunction(actorUserId: string, employerId: string, input: unknown) {
  const data = jobFunctionIdSchema.parse(input);
  await requireOwnedJobFunction(employerId, data.jobFunctionId);
  const jobFunction = await setJobFunctionActive(data.jobFunctionId, true);

  await recordAuditLog({
    userId: actorUserId,
    action: "JOB_FUNCTION_ACTIVATED",
    entity: "JobFunction",
    entityId: jobFunction.id,
    metadata: { employerId, name: jobFunction.name }
  });

  return jobFunction;
}

export async function deactivateEmployerJobFunction(actorUserId: string, employerId: string, input: unknown) {
  const data = jobFunctionIdSchema.parse(input);
  await requireOwnedJobFunction(employerId, data.jobFunctionId);
  const jobFunction = await setJobFunctionActive(data.jobFunctionId, false);

  await recordAuditLog({
    userId: actorUserId,
    action: "JOB_FUNCTION_DEACTIVATED",
    entity: "JobFunction",
    entityId: jobFunction.id,
    metadata: { employerId, name: jobFunction.name }
  });

  return jobFunction;
}

export async function activateJobFunctionByAdmin(actorUserId: string, input: unknown) {
  const data = jobFunctionIdSchema.parse(input);
  const jobFunction = await setJobFunctionActive(data.jobFunctionId, true);

  await recordAuditLog({
    userId: actorUserId,
    action: "JOB_FUNCTION_ACTIVATED",
    entity: "JobFunction",
    entityId: jobFunction.id,
    metadata: { employerId: jobFunction.employerId, moderatedBy: "admin" }
  });

  return jobFunction;
}

export async function deactivateJobFunctionByAdmin(actorUserId: string, input: unknown) {
  const data = jobFunctionIdSchema.parse(input);
  const jobFunction = await setJobFunctionActive(data.jobFunctionId, false);

  await recordAuditLog({
    userId: actorUserId,
    action: "JOB_FUNCTION_DEACTIVATED",
    entity: "JobFunction",
    entityId: jobFunction.id,
    metadata: { employerId: jobFunction.employerId, moderatedBy: "admin" }
  });

  return jobFunction;
}
