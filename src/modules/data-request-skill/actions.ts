"use server";

import { LgpdRequestType } from "@prisma/client";
import { redirect } from "next/navigation";
import { getString } from "@/lib/forms";
import { errorParam, toFriendlyError } from "@/lib/validation-errors";
import { createDataRequest } from "./service";

export async function createDataRequestAction(formData: FormData) {
  try {
    await createDataRequest({
      type: getString(formData, "type") as LgpdRequestType,
      fullName: getString(formData, "fullName"),
      email: getString(formData, "email"),
      description: getString(formData, "description")
    });
  } catch (error) {
    redirect(`/lgpd?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/lgpd/obrigado?created=1");
}
