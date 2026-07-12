"use server";

import { redirect } from "next/navigation";
import { getString } from "@/lib/forms";
import { errorParam, toFriendlyError } from "@/lib/validation-errors";
import { requireSuperAdminUser } from "@/modules/security-skill/permissions";
import {
  confirmOperationalRepassePaid,
  markCommissionPaid,
  updateOperationalRepasseSettings
} from "./service";

export async function markCommissionPaidAction(formData: FormData) {
  const user = await requireSuperAdminUser();
  await markCommissionPaid(user.id, {
    commissionId: getString(formData, "commissionId"),
    notes: getString(formData, "notes") || undefined
  });

  redirect("/admin/plano-do-sistema");
}

export async function saveOperationalRepasseSettingsAction(formData: FormData) {
  const user = await requireSuperAdminUser();
  try {
    await updateOperationalRepasseSettings(user.id, {
      maintenancePlanName: getString(formData, "maintenancePlanName"),
      maintenancePlanType: getString(formData, "maintenancePlanType"),
      maintenancePlanValue: getString(formData, "maintenancePlanValue"),
      maintenancePlanDueDate: getString(formData, "maintenancePlanDueDate"),
      maintenancePlanStatus: getString(formData, "maintenancePlanStatus"),
      maintenancePlanNotes: getString(formData, "maintenancePlanNotes"),
      operationalPixKey: getString(formData, "operationalPixKey"),
      operationalPixReceiverName: getString(formData, "operationalPixReceiverName"),
      operationalPixReceiverCity: getString(formData, "operationalPixReceiverCity")
    });
  } catch (error) {
    redirect(`/admin/plano-do-sistema?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/plano-do-sistema?saved=1");
}

export async function confirmOperationalRepasseAction(formData: FormData) {
  const user = await requireSuperAdminUser();

  try {
    await confirmOperationalRepassePaid(user.id, {
      payload: getString(formData, "payload")
    });
  } catch (error) {
    redirect(`/admin/plano-do-sistema?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/plano-do-sistema?maintenancePlanConfirmed=1");
}
