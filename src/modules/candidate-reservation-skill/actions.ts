"use server";

import { redirect } from "next/navigation";
import { getString } from "@/lib/forms";
import { errorParam, toFriendlyError } from "@/lib/validation-errors";
import { requireAdminUser, requireEmployerUser } from "@/modules/security-skill/permissions";
import {
  cancelCandidateReservationByAdmin,
  cancelCandidateReservationByEmployer,
  confirmCandidateReservationHiringByAdmin,
  reserveCandidateForJobOpening
} from "./service";

export async function reserveCandidateForJobOpeningAction(formData: FormData) {
  const user = await requireEmployerUser();
  const candidateId = getString(formData, "candidateId");

  try {
    await reserveCandidateForJobOpening({
      employerId: user.employer.id,
      actorUserId: user.id,
      candidateId,
      jobOpeningId: getString(formData, "jobOpeningId")
    });
  } catch (error) {
    redirect(`/empregador/candidatos/${encodeURIComponent(candidateId)}?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/empregador/buscar-candidatos?candidateReserved=1");
}

export async function cancelCandidateReservationByAdminAction(formData: FormData) {
  const admin = await requireAdminUser();

  try {
    await cancelCandidateReservationByAdmin({
      adminUserId: admin.id,
      reservationId: getString(formData, "reservationId")
    });
  } catch (error) {
    redirect(`/admin/candidatos?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/candidatos?reservationCanceled=1");
}

export async function confirmCandidateReservationHiringByAdminAction(formData: FormData) {
  const admin = await requireAdminUser();

  try {
    await confirmCandidateReservationHiringByAdmin({
      adminUserId: admin.id,
      reservationId: getString(formData, "reservationId")
    });
  } catch (error) {
    redirect(`/admin/candidatos?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/candidatos?candidateHired=1");
}

export async function cancelCandidateReservationByEmployerAction(formData: FormData) {
  const user = await requireEmployerUser();

  try {
    await cancelCandidateReservationByEmployer({
      employerId: user.employer.id,
      actorUserId: user.id,
      reservationId: getString(formData, "reservationId")
    });
  } catch (error) {
    redirect(`/empregador/reservas?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/empregador/reservas?reservationCanceled=1");
}
