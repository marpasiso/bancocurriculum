"use server";

import { redirect } from "next/navigation";
import { getString } from "@/lib/forms";
import { errorParam, toFriendlyError } from "@/lib/validation-errors";
import { requireAdminUser } from "@/modules/security-skill/permissions";
import {
  createGlobalJobFunction,
  setGlobalJobFunctionStatus,
  updateGlobalJobFunction
} from "./service";

export async function createGlobalJobFunctionAction(formData: FormData) {
  const admin = await requireAdminUser();

  try {
    await createGlobalJobFunction(admin.id, {
      name: getString(formData, "name"),
      description: getString(formData, "description") || undefined
    });
  } catch (error) {
    redirect(`/admin/funcoes?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/funcoes?created=1");
}

export async function updateGlobalJobFunctionAction(formData: FormData) {
  const admin = await requireAdminUser();
  const jobFunctionId = getString(formData, "jobFunctionId");

  try {
    await updateGlobalJobFunction(admin.id, {
      jobFunctionId,
      name: getString(formData, "name"),
      description: getString(formData, "description") || undefined
    });
  } catch (error) {
    redirect(`/admin/funcoes?edit=${encodeURIComponent(jobFunctionId)}&error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/funcoes?updated=1");
}

export async function activateGlobalJobFunctionAction(formData: FormData) {
  const admin = await requireAdminUser();

  try {
    await setGlobalJobFunctionStatus(admin.id, {
      jobFunctionId: getString(formData, "jobFunctionId")
    }, true);
  } catch (error) {
    redirect(`/admin/funcoes?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/funcoes?activated=1");
}

export async function deactivateGlobalJobFunctionAction(formData: FormData) {
  const admin = await requireAdminUser();

  try {
    await setGlobalJobFunctionStatus(admin.id, {
      jobFunctionId: getString(formData, "jobFunctionId")
    }, false);
  } catch (error) {
    redirect(`/admin/funcoes?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/funcoes?deactivated=1");
}
