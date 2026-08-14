"use server";

import { redirect } from "next/navigation";
import { errorParam, toFriendlyError } from "@/lib/validation-errors";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import { requestEmployerSubscriptionPayment } from "./service";

export async function requestEmployerSubscriptionPaymentAction() {
  const user = await requireEmployerUser();

  try {
    await requestEmployerSubscriptionPayment({
      employerId: user.employer.id,
      userId: user.id
    });
  } catch (error) {
    redirect(`/empregador/assinatura?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/empregador/assinatura?paymentCreated=1");
}
