"use server";

import { redirect } from "next/navigation";
import { getBoolean, getString } from "@/lib/forms";
import { errorParam, toFriendlyError } from "@/lib/validation-errors";
import { requireOperationalAdminUser, requireSuperAdminUser } from "@/modules/security-skill/permissions";
import {
  saveOperationalSettings,
  saveSubscriptionPaymentSettings
} from "./operational-settings.skill";

export async function saveOperationalSettingsAction(formData: FormData) {
  const user = await requireSuperAdminUser();

  try {
    await saveOperationalSettings(user.id, {
      platformName: getString(formData, "platformName"),
      platformDescription: getString(formData, "platformDescription"),
      fontSize: getString(formData, "fontSize"),
      readableText: getBoolean(formData, "readableText"),
      highContrast: getBoolean(formData, "highContrast")
    });
  } catch (error) {
    redirect(`/admin/configuracoes?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/configuracoes?saved=1");
}

export async function saveSubscriptionPaymentSettingsAction(formData: FormData) {
  const user = await requireOperationalAdminUser();

  try {
    await saveSubscriptionPaymentSettings(user.id, {
      subscriptionPixKey: getString(formData, "subscriptionPixKey"),
      subscriptionPixReceiverName: getString(formData, "subscriptionPixReceiverName"),
      subscriptionPixReceiverCity: getString(formData, "subscriptionPixReceiverCity"),
      subscriptionPaymentAmount: getString(formData, "subscriptionPaymentAmount")
    });
  } catch (error) {
    redirect(`/admin/pagamentos-pix?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/pagamentos-pix?saved=1");
}
