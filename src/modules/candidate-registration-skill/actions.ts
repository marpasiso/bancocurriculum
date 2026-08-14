"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBoolean, getString } from "@/lib/forms";
import { errorParam, toFriendlyError } from "@/lib/validation-errors";
import { registerCandidate } from "./service";

export async function createCandidateAction(formData: FormData) {
  try {
    await registerCandidate(
      {
        fullName: getString(formData, "fullName"),
        email: getString(formData, "email"),
        phone: getString(formData, "phone"),
        city: getString(formData, "city"),
        state: getString(formData, "state"),
        systemJobFunctionIds: formData
          .getAll("systemJobFunctionIds")
          .filter((value): value is string => typeof value === "string"),
        summary: getString(formData, "summary"),
        experience: getString(formData, "experience"),
        education: getString(formData, "education"),
        references: getString(formData, "references"),
        acceptedLgpd: getBoolean(formData, "acceptedLgpd")
      },
      {
        ipAddress: headers().get("x-forwarded-for") ?? undefined,
        userAgent: headers().get("user-agent") ?? undefined
      }
    );
  } catch (error) {
    redirect(`/candidato?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/candidato/obrigado?created=1");
}
