import { prisma } from "@/lib/prisma";

export async function listActiveSystemJobFunctions() {
  return prisma.systemJobFunction.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true
    }
  });
}

export async function listSystemJobFunctionsForAdmin() {
  return prisma.systemJobFunction.findMany({
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

export async function findActiveSystemJobFunctionsByIds(ids: string[]) {
  return prisma.systemJobFunction.findMany({
    where: {
      id: { in: ids },
      isActive: true
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true
    }
  });
}

export async function findSystemJobFunctionByName(name: string) {
  return prisma.systemJobFunction.findFirst({
    where: { name },
    select: { id: true, name: true, isActive: true }
  });
}

export async function findSystemJobFunctionById(jobFunctionId: string) {
  return prisma.systemJobFunction.findUnique({
    where: { id: jobFunctionId },
    select: { id: true, name: true, description: true, isActive: true }
  });
}

export async function createSystemJobFunction(input: { name: string; description?: string }) {
  return prisma.systemJobFunction.create({
    data: {
      name: input.name,
      description: input.description || null,
      isActive: true
    },
    select: { id: true, name: true, description: true, isActive: true }
  });
}

export async function updateSystemJobFunction(input: { jobFunctionId: string; name: string; description?: string }) {
  return prisma.systemJobFunction.update({
    where: { id: input.jobFunctionId },
    data: {
      name: input.name,
      description: input.description || null
    },
    select: { id: true, name: true, description: true, isActive: true }
  });
}

export async function setSystemJobFunctionActive(jobFunctionId: string, isActive: boolean) {
  return prisma.systemJobFunction.update({
    where: { id: jobFunctionId },
    data: { isActive },
    select: { id: true, name: true, isActive: true }
  });
}

export async function upsertSystemJobFunction(input: { name: string; description?: string; isActive?: boolean }) {
  return prisma.systemJobFunction.upsert({
    where: { name: input.name },
    update: {
      description: input.description,
      isActive: input.isActive ?? true
    },
    create: {
      name: input.name,
      description: input.description,
      isActive: input.isActive ?? true
    }
  });
}
