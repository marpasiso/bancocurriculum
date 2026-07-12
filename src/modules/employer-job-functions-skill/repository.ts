import { prisma } from "@/lib/prisma";

export async function listActiveJobFunctionsForPublicRegistration() {
  return prisma.jobFunction.findMany({
    where: { isActive: true, employer: { isActive: true } },
    orderBy: [{ name: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      description: true,
      employer: { select: { companyName: true } }
    }
  });
}

export async function listJobFunctionsByEmployer(employerId: string) {
  return prisma.jobFunction.findMany({
    where: { employerId },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { candidates: true } }
    }
  });
}

export async function listJobFunctionsForAdminModeration() {
  return prisma.jobFunction.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      employer: { select: { id: true, companyName: true, user: { select: { email: true } } } },
      _count: { select: { candidates: true } }
    }
  });
}

export async function findJobFunctionById(jobFunctionId: string) {
  return prisma.jobFunction.findUnique({
    where: { id: jobFunctionId },
    select: { id: true, employerId: true, name: true, description: true, isActive: true }
  });
}

export async function findJobFunctionByEmployerAndName(employerId: string, name: string) {
  return prisma.jobFunction.findFirst({
    where: { employerId, name },
    select: { id: true, employerId: true, name: true, isActive: true }
  });
}

export async function findActiveJobFunctionsByIds(jobFunctionIds: string[]) {
  return prisma.jobFunction.findMany({
    where: { id: { in: jobFunctionIds }, isActive: true, employer: { isActive: true } },
    select: { id: true, name: true }
  });
}

export async function insertJobFunction(input: { employerId: string; name: string; description?: string }) {
  return prisma.jobFunction.create({
    data: {
      employerId: input.employerId,
      name: input.name,
      description: input.description || null
    },
    select: { id: true, employerId: true, name: true, description: true, isActive: true }
  });
}

export async function updateJobFunction(input: {
  jobFunctionId: string;
  name: string;
  description?: string;
}) {
  return prisma.jobFunction.update({
    where: { id: input.jobFunctionId },
    data: { name: input.name, description: input.description || null },
    select: { id: true, employerId: true, name: true, description: true, isActive: true }
  });
}

export async function setJobFunctionActive(jobFunctionId: string, isActive: boolean) {
  return prisma.jobFunction.update({
    where: { id: jobFunctionId },
    data: { isActive },
    select: { id: true, employerId: true, name: true, isActive: true }
  });
}
