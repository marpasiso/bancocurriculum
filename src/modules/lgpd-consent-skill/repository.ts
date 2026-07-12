import { prisma } from "@/lib/prisma";
import type { ConsentSnapshotInput } from "./types";

export async function insertConsentSnapshot(input: ConsentSnapshotInput) {
  return prisma.consentSnapshot.create({
    data: {
      candidateId: input.candidateId,
      version: input.version,
      text: input.text,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    }
  });
}
