import type { UserRole } from "@prisma/client";
import { getAdminDataRequests } from "@/modules/data-request-skill/service";
import { recordAuditLog } from "@/modules/audit-log-skill/service";
import {
  getFinancialSettings,
  hasSubscriptionPixSettings
} from "@/modules/settings/operational-settings.skill";
import {
  confirmManualPixPaymentReceived,
  createManualSubscriptionPayment,
  generateManualPixQr
} from "@/modules/manual-payment-skill/service";
import { hashPassword } from "@/modules/security-skill/service";
import {
  activateManualSubscription,
  confirmPendingSubscriptionPayment
} from "@/modules/subscription-gate-skill/service";
import {
  cancelActiveCandidateReservationByCandidateForAdmin,
  confirmActiveCandidateReservationHiringByCandidateForAdmin,
  hasActiveCandidateReservation
} from "@/modules/candidate-reservation-skill/service";
import {
  blockAdminUser,
  blockEmployerForAdminConsole,
  countActiveSuperAdmins,
  findEmployerForAdminConsole,
  findCandidateForAdminConsole,
  findDataRequestForCandidateAnonymization,
  completeDataRequestForCandidateAnonymization,
  findAdminUserForManagement,
  findUserByEmailForAdminConsole,
  getAdminDashboardStats,
  insertAdminUser,
  listCandidateAuditLogs,
  listAdminUsersForConsole,
  listCandidatesForAdminConsole,
  type AdminCandidateSearchFilters,
  listEmployersForAdminConsole,
  anonymizeCandidateForAdminConsole,
  deleteCandidateForAdminConsole,
  unblockEmployerForAdminConsole,
  unblockAdminUser,
  updateCandidateActiveStatus,
  updateCandidateForAdminConsole,
  updateEmployerForAdminConsole,
  updateAdminUserRole
} from "./repository";
import {
  adminPaymentFormSchema,
  adminPixConfirmationSchema,
  adminPixQrSchema,
  adminSubscriptionFormSchema,
  blockAdminUserSchema,
  candidateManagementSchema,
  createAdminUserSchema,
  employerManagementSchema,
  unblockAdminUserSchema,
  updateCandidateSchema,
  updateEmployerSchema,
  updateAdminUserRoleSchema
} from "./validations";

const adminRoles = ["ADMIN", "SUPER_ADMIN"] as const;

function ensureAdminCandidatePermission(role: UserRole, action: "view" | "edit" | "inactivate" | "reactivate" | "anonymize" | "delete") {
  if (!adminRoles.includes(role as (typeof adminRoles)[number])) {
    throw new Error("Você não tem permissão para executar esta ação.");
  }

  if (action === "anonymize" && role !== "SUPER_ADMIN") {
    throw new Error("Você não tem permissão para executar esta ação.");
  }
}

export async function getAdminConsoleData() {
  const [employers, dataRequests] = await Promise.all([
    listEmployersForAdminConsole(),
    getAdminDataRequests()
  ]);

  return { employers, dataRequests };
}

export async function getAdminDashboardData() {
  const [stats, employers, dataRequests] = await Promise.all([
    getAdminDashboardStats(),
    listEmployersForAdminConsole(),
    getAdminDataRequests()
  ]);

  return {
    stats,
    employers,
    dataRequests
  };
}

export async function getAdminCandidatesData(query: string | AdminCandidateSearchFilters = "") {
  return listCandidatesForAdminConsole(query);
}

export async function getAdminCandidateDetails(actorUserId: string, actorRole: UserRole, input: unknown) {
  ensureAdminCandidatePermission(actorRole, "view");
  const data = candidateManagementSchema.parse(input);
  const candidate = await findCandidateForAdminConsole(data.candidateId);

  if (!candidate) {
    throw new Error("Candidato não encontrado.");
  }

  await recordAuditLog({
    userId: actorUserId,
    action: "CANDIDATE_VIEWED_BY_ADMIN",
    entity: "Candidate",
    entityId: candidate.id,
    metadata: { fullName: candidate.fullName, email: candidate.email }
  });

  const auditLogs = await listCandidateAuditLogs(candidate.id);

  return { ...candidate, auditLogs };
}

export async function updateManagedCandidate(actorUserId: string, actorRole: UserRole, input: unknown) {
  ensureAdminCandidatePermission(actorRole, "edit");
  const data = updateCandidateSchema.parse(input);
  const candidate = await findCandidateForAdminConsole(data.candidateId);

  if (!candidate) {
    throw new Error("Candidato não encontrado.");
  }

  const changedFields = [
    candidate.fullName !== data.fullName ? "fullName" : null,
    candidate.email !== data.email ? "email" : null,
    candidate.phone !== data.phone ? "phone" : null,
    candidate.city !== data.city ? "city" : null,
    candidate.state !== data.state ? "state" : null,
    candidate.desiredRole !== data.desiredRole ? "desiredRole" : null,
    candidate.summary !== data.summary ? "summary" : null,
    candidate.experience !== data.experience ? "experience" : null,
    candidate.education !== data.education ? "education" : null,
    (candidate.references ?? undefined) !== data.references ? "references" : null
  ].filter(Boolean);

  if (changedFields.length === 0) {
    return candidate;
  }

  const updatedCandidate = await updateCandidateForAdminConsole(data);

  await recordAuditLog({
    userId: actorUserId,
    action: "CANDIDATE_UPDATED",
    entity: "Candidate",
    entityId: updatedCandidate.id,
    metadata: { changedFields }
  });

  return updatedCandidate;
}

export async function inactivateManagedCandidate(actorUserId: string, actorRole: UserRole, input: unknown) {
  ensureAdminCandidatePermission(actorRole, "inactivate");
  const data = candidateManagementSchema.parse(input);
  const candidate = await findCandidateForAdminConsole(data.candidateId);

  if (!candidate) {
    throw new Error("Candidato não encontrado.");
  }

  if (!candidate.isActive) {
    return candidate;
  }

  if (candidate.availabilityStatus === "IN_PROCESS") {
    throw new Error("Cancele a reserva antes de desativar este candidato.");
  }

  const updatedCandidate = await updateCandidateActiveStatus(candidate.id, false);

  await recordAuditLog({
    userId: actorUserId,
    action: "CANDIDATE_INACTIVATED",
    entity: "Candidate",
    entityId: updatedCandidate.id,
    metadata: { fullName: candidate.fullName, email: candidate.email, nextStatus: "UNAVAILABLE" }
  });

  return updatedCandidate;
}

export async function reactivateManagedCandidate(actorUserId: string, actorRole: UserRole, input: unknown) {
  ensureAdminCandidatePermission(actorRole, "reactivate");
  const data = candidateManagementSchema.parse(input);
  const candidate = await findCandidateForAdminConsole(data.candidateId);

  if (!candidate) {
    throw new Error("Candidato não encontrado.");
  }

  if (candidate.isActive) {
    return candidate;
  }

  if (await hasActiveCandidateReservation(candidate.id)) {
    throw new Error("Cancele a reserva ativa antes de reativar este candidato.");
  }

  const updatedCandidate = await updateCandidateActiveStatus(candidate.id, true);

  await recordAuditLog({
    userId: actorUserId,
    action: "CANDIDATE_REACTIVATED",
    entity: "Candidate",
    entityId: updatedCandidate.id,
    metadata: { fullName: candidate.fullName, email: candidate.email, nextStatus: "AVAILABLE" }
  });

  return updatedCandidate;
}

export async function markManagedCandidateAsHired(actorUserId: string, actorRole: UserRole, input: unknown) {
  ensureAdminCandidatePermission(actorRole, "inactivate");
  const data = candidateManagementSchema.parse(input);
  await confirmActiveCandidateReservationHiringByCandidateForAdmin({
    adminUserId: actorUserId,
    candidateId: data.candidateId
  });

  return findCandidateForAdminConsole(data.candidateId);
}

export async function returnManagedCandidateToAvailable(actorUserId: string, actorRole: UserRole, input: unknown) {
  ensureAdminCandidatePermission(actorRole, "inactivate");
  const data = candidateManagementSchema.parse(input);
  await cancelActiveCandidateReservationByCandidateForAdmin({
    adminUserId: actorUserId,
    candidateId: data.candidateId
  });

  return findCandidateForAdminConsole(data.candidateId);
}

export async function anonymizeManagedCandidate(actorUserId: string, actorRole: UserRole, input: unknown) {
  ensureAdminCandidatePermission(actorRole, "anonymize");
  const data = candidateManagementSchema.parse(input);
  const candidate = await findCandidateForAdminConsole(data.candidateId);

  if (!candidate) {
    throw new Error("Candidato não encontrado.");
  }

  const dataRequest = await findDataRequestForCandidateAnonymization({
    email: candidate.email,
    fullName: candidate.fullName
  });
  const updatedCandidate = await anonymizeCandidateForAdminConsole(candidate.id);

  if (dataRequest) {
    await completeDataRequestForCandidateAnonymization(dataRequest.id);
  }

  await recordAuditLog({
    userId: actorUserId,
    action: "CANDIDATE_ANONYMIZED",
    entity: "Candidate",
    entityId: updatedCandidate.id,
    metadata: {
      previousEmail: candidate.email,
      previousFullName: candidate.fullName,
      dataRequestId: dataRequest?.id,
      dataRequestType: dataRequest?.type
    }
  });

  return updatedCandidate;
}


export async function deleteManagedCandidate(actorUserId: string, actorRole: UserRole, input: unknown) {
  ensureAdminCandidatePermission(actorRole, "delete");
  const data = candidateManagementSchema.parse(input);
  const candidate = await findCandidateForAdminConsole(data.candidateId);

  if (!candidate) {
    throw new Error("Candidato não encontrado.");
  }

  const dataRequest = await findDataRequestForCandidateAnonymization({
    email: candidate.email,
    fullName: candidate.fullName
  });

  await deleteCandidateForAdminConsole(candidate.id);

  if (dataRequest) {
    await completeDataRequestForCandidateAnonymization(dataRequest.id);
  }

  await recordAuditLog({
    userId: actorUserId,
    action: "CANDIDATE_DELETED",
    entity: "Candidate",
    entityId: candidate.id,
    metadata: {
      previousEmail: candidate.email,
      previousFullName: candidate.fullName,
      dataRequestId: dataRequest?.id,
      dataRequestType: dataRequest?.type
    }
  });

  return { id: candidate.id };
}
export async function getAdminUsersData() {
  return listAdminUsersForConsole();
}

export async function getAdminEmployerDetails(actorUserId: string, input: unknown) {
  const data = employerManagementSchema.parse(input);
  const employer = await findEmployerForAdminConsole(data.employerId);

  if (!employer) {
    throw new Error("Empregador nao encontrado.");
  }

  await recordAuditLog({
    userId: actorUserId,
    action: "EMPLOYER_VIEWED_BY_ADMIN",
    entity: "Employer",
    entityId: employer.id,
    metadata: { companyName: employer.companyName }
  });

  return employer;
}

export async function blockManagedEmployer(actorUserId: string, input: unknown) {
  const data = employerManagementSchema.parse(input);
  const employer = await findEmployerForAdminConsole(data.employerId);

  if (!employer) {
    throw new Error("Empregador nao encontrado.");
  }

  if (!employer.isActive) {
    return employer;
  }

  const updatedEmployer = await blockEmployerForAdminConsole(data.employerId);

  await recordAuditLog({
    userId: actorUserId,
    action: "EMPLOYER_BLOCKED",
    entity: "Employer",
    entityId: updatedEmployer.id,
    metadata: { companyName: updatedEmployer.companyName }
  });

  return updatedEmployer;
}

export async function unblockManagedEmployer(actorUserId: string, input: unknown) {
  const data = employerManagementSchema.parse(input);
  const employer = await findEmployerForAdminConsole(data.employerId);

  if (!employer) {
    throw new Error("Empregador nao encontrado.");
  }

  if (employer.isActive) {
    return employer;
  }

  const updatedEmployer = await unblockEmployerForAdminConsole(data.employerId);

  await recordAuditLog({
    userId: actorUserId,
    action: "EMPLOYER_UNBLOCKED",
    entity: "Employer",
    entityId: updatedEmployer.id,
    metadata: { companyName: updatedEmployer.companyName }
  });

  return updatedEmployer;
}

export async function updateManagedEmployer(actorUserId: string, input: unknown) {
  const data = updateEmployerSchema.parse(input);
  const employer = await findEmployerForAdminConsole(data.employerId);

  if (!employer) {
    throw new Error("Empregador nao encontrado.");
  }

  const existingUser = await findUserByEmailForAdminConsole(data.email);
  if (existingUser && existingUser.id !== employer.userId) {
    throw new Error("E-mail ja cadastrado para outro usuario.");
  }

  const changedFields = [
    employer.companyName !== data.companyName ? "companyName" : null,
    employer.contactName !== data.contactName ? "contactName" : null,
    employer.document !== data.document ? "document" : null,
    employer.user.email !== data.email ? "email" : null
  ].filter(Boolean);

  if (changedFields.length === 0) {
    return employer;
  }

  const updatedEmployer = await updateEmployerForAdminConsole({
    employerId: data.employerId,
    userId: employer.userId,
    companyName: data.companyName,
    contactName: data.contactName,
    document: data.document,
    email: data.email
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "EMPLOYER_UPDATED",
    entity: "Employer",
    entityId: updatedEmployer.id,
    metadata: { changedFields }
  });

  return updatedEmployer;
}

export async function createManagedAdminUser(actorUserId: string, input: unknown) {
  const data = createAdminUserSchema.parse(input);
  const passwordHash = await hashPassword(data.password);
  const user = await insertAdminUser({ ...data, passwordHash });

  await recordAuditLog({
    userId: actorUserId,
    action: "ADMIN_USER_CREATED",
    entity: "User",
    entityId: user.id,
    metadata: { email: user.email, role: user.role }
  });

  return user;
}

export async function updateManagedAdminRole(actorUserId: string, input: unknown) {
  const data = updateAdminUserRoleSchema.parse(input);
  const target = await findAdminUserForManagement(data.userId);

  if (!target) {
    throw new Error("Administrador nao encontrado.");
  }

  if (target.id === actorUserId && data.role !== "SUPER_ADMIN") {
    throw new Error("Você não pode remover sua própria permissão administrativa principal.");
  }

  if (target.role === "SUPER_ADMIN" && data.role !== "SUPER_ADMIN" && (await countActiveSuperAdmins()) <= 1) {
    throw new Error("Não é permitido remover o último administrador principal ativo.");
  }

  const user = await updateAdminUserRole(data.userId, data.role);

  await recordAuditLog({
    userId: actorUserId,
    action: "ADMIN_USER_ROLE_UPDATED",
    entity: "User",
    entityId: user.id,
    metadata: { previousRole: target.role, nextRole: user.role }
  });

  return user;
}

export async function blockManagedAdminUser(actorUserId: string, input: unknown) {
  const data = blockAdminUserSchema.parse(input);
  const target = await findAdminUserForManagement(data.userId);

  if (!target) {
    throw new Error("Administrador nao encontrado.");
  }

  if (target.id === actorUserId) {
    throw new Error("Voce nao pode bloquear a si mesmo.");
  }

  if (target.role === "SUPER_ADMIN" && (await countActiveSuperAdmins()) <= 1) {
    throw new Error("Não é permitido bloquear o último administrador principal ativo.");
  }

  const user = await blockAdminUser(data.userId);

  await recordAuditLog({
    userId: actorUserId,
    action: "ADMIN_USER_BLOCKED",
    entity: "User",
    entityId: user.id,
    metadata: { email: user.email, role: user.role }
  });

  return user;
}

export async function unblockManagedAdminUser(actorUserId: string, input: unknown) {
  const data = unblockAdminUserSchema.parse(input);
  const target = await findAdminUserForManagement(data.userId);

  if (!target) {
    throw new Error("Administrador nao encontrado.");
  }

  if (target.isActive) {
    return target;
  }

  const user = await unblockAdminUser(data.userId);

  await recordAuditLog({
    userId: actorUserId,
    action: "ADMIN_USER_UNBLOCKED",
    entity: "User",
    entityId: user.id,
    metadata: { email: user.email, role: user.role }
  });

  return user;
}

export async function createAdminManualPayment(adminUserId: string, input: unknown) {
  const data = adminPaymentFormSchema.parse(input);
  return createManualSubscriptionPayment(adminUserId, data);
}

export async function activateAdminSubscription(adminUserId: string, input: unknown) {
  const data = adminSubscriptionFormSchema.parse(input);
  return activateManualSubscription({ ...data, adminUserId });
}

export async function generateAdminPixQr(input: unknown) {
  const data = adminPixQrSchema.parse(input);
  return generateManualPixQr(data);
}

export async function confirmAdminPixReceived(adminUserId: string, input: unknown) {
  const data = adminPixConfirmationSchema.parse(input);
  const settings = await getFinancialSettings();

  if (!hasSubscriptionPixSettings(settings)) {
    throw new Error("Configure os dados Pix de assinatura antes de confirmar o pagamento.");
  }

  const expected = await generateManualPixQr({
    employerId: data.employerId,
    amountCents: Math.round(Number(settings.subscriptionPaymentAmount) * 100),
    pixKey: settings.subscriptionPixKey,
    receiverName: settings.subscriptionPixReceiverName,
    receiverCity: settings.subscriptionPixReceiverCity,
    description: data.description
  });

  if (expected.payload !== data.payload) {
    throw new Error("Os dados da cobranca foram alterados. Gere o Pix novamente antes de confirmar.");
  }

  return confirmManualPixPaymentReceived(adminUserId, {
    ...expected,
    payload: data.payload
  });
}

export async function confirmAdminPendingPixPayment(adminUserId: string, input: unknown) {
  const data = adminSubscriptionFormSchema.parse(input);
  return confirmPendingSubscriptionPayment({ ...data, adminUserId });
}





