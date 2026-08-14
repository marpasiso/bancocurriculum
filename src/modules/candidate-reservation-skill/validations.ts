import { z } from "zod";

export const reserveCandidateForJobOpeningSchema = z.object({
  employerId: z.string().min(1),
  actorUserId: z.string().min(1),
  candidateId: z.string().min(1),
  jobOpeningId: z.string().min(1, "Selecione uma vaga aberta para reservar o candidato.")
});

export const adminReservationSchema = z.object({
  adminUserId: z.string().min(1),
  reservationId: z.string().min(1)
});

export const adminCandidateReservationSchema = z.object({
  adminUserId: z.string().min(1),
  candidateId: z.string().min(1)
});
