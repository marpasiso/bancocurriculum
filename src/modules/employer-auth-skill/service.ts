import { UserRole } from "@prisma/client";
import { recordAuditLog } from "@/modules/audit-log-skill/service";
import { createSecureSession, hashPassword, verifyPassword } from "@/modules/security-skill/service";
import {
  findEmployerAccountByUserId,
  findUserIdByEmail,
  findUserWithPasswordByEmail,
  insertEmployerUser,
  updateEmployerAccount,
  updateUserPasswordHash
} from "./repository";
import {
  employerAccountUpdateSchema,
  employerPasswordChangeSchema,
  employerRegistrationSchema,
  loginSchema
} from "./validations";

export async function registerEmployerAccount(input: unknown) {
  const data = employerRegistrationSchema.parse(input);
  const passwordHash = await hashPassword(data.password);

  const user = await insertEmployerUser({
    email: data.email,
    passwordHash,
    companyName: data.companyName,
    contactName: data.contactName,
    document: data.document
  });

  await recordAuditLog({
    userId: user.id,
    action: "EMPLOYER_REGISTERED",
    entity: "User",
    entityId: user.id
  });

  await createSecureSession(user.id);
}

export async function loginUser(input: unknown) {
  const data = loginSchema.parse(input);
  const user = await findUserWithPasswordByEmail(data.email);

  if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
    throw new Error("E-mail ou senha invalidos.");
  }

  if (!user.isActive) {
    throw new Error("Usuario bloqueado. Solicite suporte administrativo.");
  }

  await createSecureSession(user.id);

  if (user.role === UserRole.ADMIN) {
    await recordAuditLog({
      userId: user.id,
      action: "ADMIN_LOGIN",
      entity: "User",
      entityId: user.id
    });
  }

  return { role: user.role };
}

export async function getEmployerAccount(userId: string) {
  const account = await findEmployerAccountByUserId(userId);
  if (!account?.employer) {
    throw new Error("Conta de empregador nao encontrada.");
  }

  return { ...account, employer: account.employer };
}

export async function updateOwnEmployerAccount(actorUserId: string, input: unknown) {
  const data = employerAccountUpdateSchema.parse(input);

  if (data.userId !== actorUserId) {
    throw new Error("Voce nao pode alterar dados de outra conta.");
  }

  const account = await getEmployerAccount(actorUserId);
  if (account.employer.id !== data.employerId) {
    throw new Error("Empresa nao pertence ao usuario autenticado.");
  }

  const existingUser = await findUserIdByEmail(data.email);
  if (existingUser && existingUser.id !== actorUserId) {
    throw new Error("E-mail ja cadastrado para outro usuario.");
  }

  const updated = await updateEmployerAccount(data);

  await recordAuditLog({
    userId: actorUserId,
    action: "EMPLOYER_ACCOUNT_UPDATED",
    entity: "Employer",
    entityId: data.employerId,
    metadata: { changedBy: "employer" }
  });

  return updated;
}

export async function changeOwnEmployerPassword(actorUserId: string, input: unknown) {
  const data = employerPasswordChangeSchema.parse(input);

  if (data.userId !== actorUserId) {
    throw new Error("Voce nao pode alterar senha de outra conta.");
  }

  const user = await findUserWithPasswordByEmail((await getEmployerAccount(actorUserId)).email);
  if (!user || !(await verifyPassword(data.currentPassword, user.passwordHash))) {
    throw new Error("Senha atual invalida.");
  }

  const passwordHash = await hashPassword(data.newPassword);
  await updateUserPasswordHash(actorUserId, passwordHash);

  await recordAuditLog({
    userId: actorUserId,
    action: "EMPLOYER_PASSWORD_CHANGED",
    entity: "User",
    entityId: actorUserId
  });
}
