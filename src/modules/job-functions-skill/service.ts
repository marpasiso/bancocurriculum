import { recordAuditLog } from "@/modules/audit-log-skill/service";
import {
  createSystemJobFunction,
  findActiveSystemJobFunctionsByIds,
  findSystemJobFunctionById,
  findSystemJobFunctionByName,
  listActiveSystemJobFunctions,
  listSystemJobFunctionsForAdmin,
  setSystemJobFunctionActive,
  updateSystemJobFunction,
  upsertSystemJobFunction
} from "./repository";
import {
  systemJobFunctionFormSchema,
  systemJobFunctionSelectionSchema,
  systemJobFunctionStatusSchema,
  updateSystemJobFunctionFormSchema
} from "./validations";

export function normalizeSystemJobFunctionName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export async function getActiveSystemJobFunctions() {
  return listActiveSystemJobFunctions();
}

export async function getAdminSystemJobFunctions() {
  return listSystemJobFunctionsForAdmin();
}

export async function validateActiveSystemJobFunctions(input: unknown) {
  const selectedIds = systemJobFunctionSelectionSchema.parse(input);
  const uniqueIds = [...new Set(selectedIds)];
  const functions = await findActiveSystemJobFunctionsByIds(uniqueIds);

  if (functions.length !== uniqueIds.length) {
    throw new Error("Selecione apenas funções ativas e disponíveis no sistema.");
  }

  return functions;
}

export async function saveSystemJobFunction(actorUserId: string, input: unknown) {
  const parsed = systemJobFunctionFormSchema.parse(input);
  const data = {
    ...parsed,
    name: normalizeSystemJobFunctionName(parsed.name)
  };

  const existing = await findSystemJobFunctionByName(data.name);
  if (existing && existing.isActive === data.isActive) {
    throw new Error("Esta função já está cadastrada no sistema.");
  }

  const jobFunction = await upsertSystemJobFunction(data);

  await recordAuditLog({
    userId: actorUserId,
    action: "SYSTEM_JOB_FUNCTION_SAVED",
    entity: "SystemJobFunction",
    entityId: jobFunction.id,
    metadata: { fields: ["name", "description", "isActive"] }
  });

  return jobFunction;
}

export async function createGlobalJobFunction(actorUserId: string, input: unknown) {
  const parsed = systemJobFunctionFormSchema.parse(input);
  const data = {
    ...parsed,
    name: normalizeSystemJobFunctionName(parsed.name)
  };
  const existing = await findSystemJobFunctionByName(data.name);

  if (existing) {
    throw new Error("Esta função já está cadastrada no sistema.");
  }

  const jobFunction = await createSystemJobFunction(data);

  await recordAuditLog({
    userId: actorUserId,
    action: "SYSTEM_JOB_FUNCTION_CREATED",
    entity: "SystemJobFunction",
    entityId: jobFunction.id,
    metadata: { name: jobFunction.name }
  });

  return jobFunction;
}

export async function updateGlobalJobFunction(actorUserId: string, input: unknown) {
  const parsed = updateSystemJobFunctionFormSchema.parse(input);
  const data = {
    ...parsed,
    name: normalizeSystemJobFunctionName(parsed.name)
  };
  const current = await findSystemJobFunctionById(data.jobFunctionId);

  if (!current) {
    throw new Error("Função não encontrada.");
  }

  const existing = await findSystemJobFunctionByName(data.name);
  if (existing && existing.id !== data.jobFunctionId) {
    throw new Error("Esta função já está cadastrada no sistema.");
  }

  const jobFunction = await updateSystemJobFunction(data);

  await recordAuditLog({
    userId: actorUserId,
    action: "SYSTEM_JOB_FUNCTION_UPDATED",
    entity: "SystemJobFunction",
    entityId: jobFunction.id,
    metadata: { name: jobFunction.name }
  });

  return jobFunction;
}

export async function setGlobalJobFunctionStatus(actorUserId: string, input: unknown, isActive: boolean) {
  const parsed = systemJobFunctionStatusSchema.parse(input);
  const current = await findSystemJobFunctionById(parsed.jobFunctionId);

  if (!current) {
    throw new Error("Função não encontrada.");
  }

  const jobFunction = await setSystemJobFunctionActive(parsed.jobFunctionId, isActive);

  await recordAuditLog({
    userId: actorUserId,
    action: isActive ? "SYSTEM_JOB_FUNCTION_ACTIVATED" : "SYSTEM_JOB_FUNCTION_DEACTIVATED",
    entity: "SystemJobFunction",
    entityId: jobFunction.id,
    metadata: { name: jobFunction.name }
  });

  return jobFunction;
}
