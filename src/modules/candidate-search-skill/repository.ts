import { prisma } from "@/lib/prisma";

export async function searchCandidateList(input: { query?: string; role?: string; city?: string } = {}) {
  const query = input.query?.trim() ?? "";
  const role = input.role?.trim() ?? "";
  const city = input.city?.trim() ?? "";

  return prisma.candidate.findMany({
    where: {
      isActive: true,
      AND: [
        query
          ? {
              OR: [
                { fullName: { contains: query } },
                { desiredRole: { contains: query } },
                { city: { contains: query } },
                { state: { contains: query } }
              ]
            }
          : {},
        role ? { desiredRole: { contains: role } } : {},
        city
          ? {
              OR: [
                { city: { contains: city } },
                { state: { contains: city } }
              ]
            }
          : {}
      ]
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      city: true,
      state: true,
      desiredRole: true,
      summary: true,
      createdAt: true
    }
  });
}
