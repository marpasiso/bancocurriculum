"use server";

import { redirect } from "next/navigation";
import { getString } from "@/lib/forms";
import { errorParam, toFriendlyError } from "@/lib/validation-errors";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import { startCandidateProcessForEmployer } from "./service";

export async function startCandidateProcessAction(formData: FormData) {
  const user = await requireEmployerUser();
  const candidateId = getString(formData, "candidateId");

  try {
    await startCandidateProcessForEmployer({
      employerId: user.employer.id,
      candidateId,
      viewedById: user.id,
      jobOpeningId: getString(formData, "jobOpeningId")
    });
  } catch (error) {
    redirect(`/empregador/candidatos/${encodeURIComponent(candidateId)}?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/empregador/buscar-candidatos?candidateInProcess=1");
}
