"use server";

import { redirect } from "next/navigation";
import { getString } from "@/lib/forms";
import { errorParam, toFriendlyError } from "@/lib/validation-errors";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import { destroySecureSession } from "@/modules/security-skill/session";
import {
  changeOwnEmployerPassword,
  loginUser,
  registerEmployerAccount,
  updateOwnEmployerAccount
} from "./service";

export async function loginAction(formData: FormData) {
  let destination = "/admin/dashboard?login=1";

  try {
    const result = await loginUser({
      email: getString(formData, "email"),
      password: getString(formData, "password")
    });

    if (result.role === "EMPLOYER") destination = "/empregador/dashboard?login=1";
    if (result.role === "SUPER_ADMIN") destination = "/admin/dashboard?login=1";
  } catch (error) {
    redirect(`/login?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect(destination);
}

export async function registerEmployerAction(formData: FormData) {
  try {
    await registerEmployerAccount({
      email: getString(formData, "email"),
      password: getString(formData, "password"),
      companyName: getString(formData, "companyName"),
      contactName: getString(formData, "contactName"),
      document: getString(formData, "document")
    });
  } catch (error) {
    redirect(`/empregador/cadastro?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/empregador/dashboard?employerRegistered=1");
}

export async function logoutAction() {
  await destroySecureSession();
  redirect("/");
}

export async function updateOwnEmployerAccountAction(formData: FormData) {
  const user = await requireEmployerUser();
  try {
    await updateOwnEmployerAccount(user.id, {
      userId: user.id,
      employerId: user.employer.id,
      email: getString(formData, "email"),
      companyName: getString(formData, "companyName"),
      contactName: getString(formData, "contactName"),
      document: getString(formData, "document")
    });
  } catch (error) {
    redirect(`/empregador/minha-conta?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/empregador/minha-conta?saved=1");
}

export async function changeOwnEmployerPasswordAction(formData: FormData) {
  const user = await requireEmployerUser();
  try {
    await changeOwnEmployerPassword(user.id, {
      userId: user.id,
      currentPassword: getString(formData, "currentPassword"),
      newPassword: getString(formData, "newPassword")
    });
  } catch (error) {
    redirect(`/empregador/minha-conta?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/empregador/minha-conta?passwordChanged=1");
}
