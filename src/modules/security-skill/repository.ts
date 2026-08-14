import { prisma } from "@/lib/prisma";

export async function insertSession(input: { tokenHash: string; userId: string; expiresAt: Date }) {
  return prisma.session.create({ data: input });
}

export async function deleteSessionByTokenHash(tokenHash: string) {
  return prisma.session.deleteMany({ where: { tokenHash } });
}

export async function deleteSessionById(id: string) {
  return prisma.session.delete({ where: { id } });
}

export async function findSafeSessionByTokenHash(tokenHash: string) {
  return prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          employer: { select: { id: true, companyName: true, isActive: true } }
        }
      }
    }
  });
}
