import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function findUserWithPasswordByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function insertEmployerUser(input: {
  email: string;
  passwordHash: string;
  companyName: string;
  contactName: string;
  document: string;
}) {
  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash: input.passwordHash,
      role: UserRole.EMPLOYER,
      employer: {
        create: {
          companyName: input.companyName,
          contactName: input.contactName,
          document: input.document,
          isActive: true
        }
      }
    },
    select: { id: true }
  });
}

export async function findEmployerAccountByUserId(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      employer: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          document: true,
          isActive: true
        }
      }
    }
  });
}

export async function findUserIdByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });
}

export async function updateEmployerAccount(input: {
  userId: string;
  employerId: string;
  email: string;
  companyName: string;
  contactName: string;
  document: string;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: input.userId },
      data: { email: input.email }
    });

    return tx.employer.update({
      where: { id: input.employerId },
      data: {
        companyName: input.companyName,
        contactName: input.contactName,
        document: input.document
      },
      select: { id: true, companyName: true, contactName: true, document: true, isActive: true }
    });
  });
}

export async function updateUserPasswordHash(userId: string, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
    select: { id: true }
  });
}
