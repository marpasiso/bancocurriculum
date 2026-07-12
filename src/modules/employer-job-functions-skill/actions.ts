"use server";

import { redirect } from "next/navigation";
import { requireEmployerUser, requireOperationalAdminUser } from "@/modules/security-skill/permissions";

const globalFunctionsNotice = "As funções e vagas são gerenciadas pela administração do sistema.";

export async function createJobFunctionAction() {
  await requireEmployerUser();
  redirect(`/empregador/dashboard?info=${encodeURIComponent(globalFunctionsNotice)}`);
}

export async function updateJobFunctionAction() {
  await requireEmployerUser();
  redirect(`/empregador/dashboard?info=${encodeURIComponent(globalFunctionsNotice)}`);
}

export async function activateJobFunctionAction() {
  await requireEmployerUser();
  redirect(`/empregador/dashboard?info=${encodeURIComponent(globalFunctionsNotice)}`);
}

export async function deactivateJobFunctionAction() {
  await requireEmployerUser();
  redirect(`/empregador/dashboard?info=${encodeURIComponent(globalFunctionsNotice)}`);
}

export async function adminActivateJobFunctionAction() {
  await requireOperationalAdminUser();
  redirect(`/admin/funcoes?info=${encodeURIComponent("Use a lista global de funções e vagas.")}`);
}

export async function adminDeactivateJobFunctionAction() {
  await requireOperationalAdminUser();
  redirect(`/admin/funcoes?info=${encodeURIComponent("Use a lista global de funções e vagas.")}`);
}
