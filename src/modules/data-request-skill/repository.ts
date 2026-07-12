import { prisma } from "@/lib/prisma";
import type { DataRequestInput } from "./types";

export async function insertDataRequest(input: DataRequestInput) {
  return prisma.lgpdRequest.create({ data: input });
}

export async function listDataRequestsForAdmin() {
  return prisma.lgpdRequest.findMany({
    orderBy: { createdAt: "desc" }
  });
}
