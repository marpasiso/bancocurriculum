import { createHash, randomBytes } from "node:crypto";
import { assertSmtpConfigured, getRequiredAppUrl, sendSmtpMail } from "@/lib/smtp";
import { recordAuditLog } from "@/modules/audit-log-skill/service";
import { hashPassword } from "@/modules/security-skill/service";
import {
  createPasswordResetToken,
  findActiveUserForPasswordReset,
  markPasswordResetTokenUsedByHash,
  resetPasswordWithToken
} from "./repository";
import { passwordResetConfirmSchema, passwordResetRequestSchema } from "./validations";

const RESET_TOKEN_EXPIRATION_MINUTES = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function hashEmail(email: string) {
  return createHash("sha256").update(email).digest("hex");
}

export async function requestPasswordReset(input: unknown) {
  const data = passwordResetRequestSchema.parse(input);
  const appUrl = getRequiredAppUrl();
  assertSmtpConfigured();
  const user = await findActiveUserForPasswordReset(data.email);

  await recordAuditLog({
    userId: user?.id,
    action: "PASSWORD_RESET_REQUESTED",
    entity: "User",
    entityId: user?.id,
    metadata: { emailHash: hashEmail(data.email) }
  });

  if (!user || !user.isActive) {
    return;
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000);

  await createPasswordResetToken({ userId: user.id, tokenHash, expiresAt });

  const resetUrl = `${appUrl}/redefinir-senha?token=${encodeURIComponent(token)}`;

  try {
    await sendSmtpMail({
      to: user.email,
      subject: "Redefinição de senha",
      text: [
        "Você solicitou a redefinição de senha.",
        "",
        "Acesse o link abaixo para criar uma nova senha:",
        resetUrl,
        "",
        "Este link expira em 30 minutos.",
        "Se você não solicitou esta alteração, ignore esta mensagem."
      ].join("\n")
    });
  } catch (error) {
    await markPasswordResetTokenUsedByHash(tokenHash);
    throw error;
  }
}

export async function resetPassword(input: unknown) {
  const data = passwordResetConfirmSchema.parse(input);
  const passwordHash = await hashPassword(data.password);
  const result = await resetPasswordWithToken({
    tokenHash: hashToken(data.token),
    passwordHash,
    usedAt: new Date()
  });

  await recordAuditLog({
    userId: result.userId,
    action: "PASSWORD_RESET_COMPLETED",
    entity: "User",
    entityId: result.userId
  });
}
