import { prisma } from "@/lib/prisma";

export async function findActiveUserForPasswordReset(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, isActive: true, role: true }
  });
}

export async function createPasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  return prisma.$transaction(async (tx) => {
    const usedAt = new Date();

    await tx.passwordResetToken.updateMany({
      where: { userId: input.userId, usedAt: null },
      data: { usedAt }
    });

    return tx.passwordResetToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt
      },
      select: { id: true }
    });
  });
}

export async function resetPasswordWithToken(input: {
  tokenHash: string;
  passwordHash: string;
  usedAt: Date;
}) {
  return prisma.$transaction(async (tx) => {
    const resetToken = await tx.passwordResetToken.findUnique({
      where: { tokenHash: input.tokenHash },
      select: {
        id: true,
        expiresAt: true,
        usedAt: true,
        user: { select: { id: true, isActive: true } }
      }
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= input.usedAt || !resetToken.user.isActive) {
      throw new Error("Link inválido ou expirado.");
    }

    await tx.user.update({
      where: { id: resetToken.user.id },
      data: { passwordHash: input.passwordHash },
      select: { id: true }
    });

    await tx.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: input.usedAt },
      select: { id: true }
    });

    return { userId: resetToken.user.id };
  });
}

export async function markPasswordResetTokenUsedByHash(tokenHash: string, usedAt = new Date()) {
  return prisma.passwordResetToken.updateMany({
    where: { tokenHash, usedAt: null },
    data: { usedAt }
  });
}
