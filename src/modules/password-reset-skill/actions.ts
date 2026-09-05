"use server";

import { redirect } from "next/navigation";
import { getString } from "@/lib/forms";
import { errorParam, toFriendlyError } from "@/lib/validation-errors";
import { requestPasswordReset, resetPassword } from "./service";

const genericRequestMessage = "Se o e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.";

export async function requestPasswordResetAction(formData: FormData) {
  try {
    await requestPasswordReset({ email: getString(formData, "email") });
  } catch (error) {
    redirect(`/esqueci-minha-senha?error=${errorParam(toFriendlyError(error, "Não foi possível enviar as instruções agora. Tente novamente mais tarde."))}`);
  }

  redirect(`/esqueci-minha-senha?sent=${errorParam(genericRequestMessage)}`);
}

export async function resetPasswordAction(formData: FormData) {
  const token = getString(formData, "token");

  try {
    await resetPassword({
      token,
      password: getString(formData, "password"),
      confirmPassword: getString(formData, "confirmPassword")
    });
  } catch (error) {
    redirect(`/redefinir-senha?token=${encodeURIComponent(token)}&error=${errorParam(toFriendlyError(error, "Não foi possível redefinir a senha. Solicite um novo link e tente novamente."))}`);
  }

  redirect("/login?passwordReset=1");
}
