"use server";

import { redirect } from "next/navigation";
import { getString } from "@/lib/forms";
import { errorParam, toFriendlyError } from "@/lib/validation-errors";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import {
  cancelEmployerJobOpening,
  closeEmployerJobOpening,
  createEmployerJobOpening,
  pauseEmployerJobOpening,
  resumeEmployerJobOpening
} from "./service";

export async function createEmployerJobOpeningAction(formData: FormData) {
  const user = await requireEmployerUser();

  try {
    await createEmployerJobOpening({
      employerId: user.employer.id,
      actorUserId: user.id,
      systemJobFunctionId: getString(formData, "systemJobFunctionId"),
      title: getString(formData, "title"),
      description: getString(formData, "description"),
      city: getString(formData, "city"),
      state: getString(formData, "state"),
      requirements: getString(formData, "requirements"),
      quantity: getString(formData, "quantity")
    });
  } catch (error) {
    redirect(`/empregador/vagas/nova?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/empregador/vagas?created=1");
}

export async function pauseEmployerJobOpeningAction(formData: FormData) {
  await updateEmployerJobOpeningStatusAction(formData, pauseEmployerJobOpening, "paused=1");
}

export async function resumeEmployerJobOpeningAction(formData: FormData) {
  await updateEmployerJobOpeningStatusAction(formData, resumeEmployerJobOpening, "resumed=1");
}

export async function closeEmployerJobOpeningAction(formData: FormData) {
  await updateEmployerJobOpeningStatusAction(formData, closeEmployerJobOpening, "closed=1");
}

export async function cancelEmployerJobOpeningAction(formData: FormData) {
  await updateEmployerJobOpeningStatusAction(formData, cancelEmployerJobOpening, "canceled=1");
}

async function updateEmployerJobOpeningStatusAction(
  formData: FormData,
  handler: (input: unknown) => Promise<unknown>,
  successParam: string
) {
  const user = await requireEmployerUser();

  try {
    if (handler === closeEmployerJobOpening && getString(formData, "confirmClose") !== "yes") {
      throw new Error("Confirme o encerramento da vaga antes de continuar.");
    }

    if (handler === cancelEmployerJobOpening && getString(formData, "confirmCancel") !== "yes") {
      throw new Error("Confirme o cancelamento da vaga antes de continuar.");
    }

    await handler({
      employerId: user.employer.id,
      actorUserId: user.id,
      jobOpeningId: getString(formData, "jobOpeningId")
    });
  } catch (error) {
    redirect(`/empregador/vagas?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect(`/empregador/vagas?${successParam}`);
}
