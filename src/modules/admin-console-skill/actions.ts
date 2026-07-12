"use server";

import { redirect } from "next/navigation";
import { getString } from "@/lib/forms";
import { errorParam, toFriendlyError } from "@/lib/validation-errors";
import { requireOperationalAdminUser, requireSuperAdminUser } from "@/modules/security-skill/permissions";
import {
  activateAdminSubscription,
  anonymizeManagedCandidate,
  blockManagedEmployer,
  blockManagedAdminUser,
  confirmAdminPixReceived,
  createAdminManualPayment,
  createManagedAdminUser,
  getAdminEmployerDetails,
  inactivateManagedCandidate,
  reactivateManagedCandidate,
  unblockManagedEmployer,
  unblockManagedAdminUser,
  updateManagedCandidate,
  updateManagedEmployer,
  updateManagedAdminRole
} from "./service";

export async function createPaymentAction(formData: FormData) {
  const admin = await requireOperationalAdminUser();
  try {
    await createAdminManualPayment(admin.id, {
      employerId: getString(formData, "employerId"),
      amountCents: Math.round(Number(getString(formData, "amount")) * 100),
      pixCode: getString(formData, "pixCode"),
      note: getString(formData, "note")
    });
  } catch (error) {
    redirect(`/admin/pagamentos-pix?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/pagamentos-pix?paymentCreated=1");
}

export async function activateSubscriptionAction(formData: FormData) {
  const admin = await requireOperationalAdminUser();
  try {
    await activateAdminSubscription(admin.id, {
      employerId: getString(formData, "employerId"),
      paymentId: getString(formData, "paymentId")
    });
  } catch (error) {
    redirect(`/admin/empregadores?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/empregadores?subscriptionActivated=1");
}

export async function confirmPixReceivedAction(formData: FormData) {
  const admin = await requireOperationalAdminUser();
  try {
    await confirmAdminPixReceived(admin.id, {
      employerId: getString(formData, "employerId"),
      amountCents: Math.round(Number(getString(formData, "amount")) * 100),
      pixKey: getString(formData, "pixKey"),
      receiverName: getString(formData, "receiverName"),
      receiverCity: getString(formData, "receiverCity"),
      description: getString(formData, "description"),
      payload: getString(formData, "payload")
    });
  } catch (error) {
    redirect(`/admin/pagamentos-pix?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/pagamentos-pix?pixConfirmed=1");
}

export async function createAdminUserAction(formData: FormData) {
  const admin = await requireSuperAdminUser();
  try {
    await createManagedAdminUser(admin.id, {
      email: getString(formData, "email"),
      password: getString(formData, "password"),
      role: getString(formData, "role")
    });
  } catch (error) {
    redirect(`/admin/administradores?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/administradores?adminCreated=1");
}

export async function updateAdminUserRoleAction(formData: FormData) {
  const admin = await requireSuperAdminUser();
  try {
    await updateManagedAdminRole(admin.id, {
      userId: getString(formData, "userId"),
      role: getString(formData, "role")
    });
  } catch (error) {
    redirect(`/admin/administradores?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/administradores?adminUpdated=1");
}

export async function blockAdminUserAction(formData: FormData) {
  const admin = await requireSuperAdminUser();
  try {
    await blockManagedAdminUser(admin.id, {
      userId: getString(formData, "userId")
    });
  } catch (error) {
    redirect(`/admin/administradores?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/administradores?adminBlocked=1");
}

export async function unblockAdminUserAction(formData: FormData) {
  const admin = await requireSuperAdminUser();
  try {
    await unblockManagedAdminUser(admin.id, {
      userId: getString(formData, "userId")
    });
  } catch (error) {
    redirect(`/admin/administradores?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/administradores?adminUnblocked=1");
}

export async function viewEmployerAction(formData: FormData) {
  const admin = await requireOperationalAdminUser();
  const employerId = getString(formData, "employerId");
  await getAdminEmployerDetails(admin.id, { employerId });

  redirect(`/admin/empregadores?viewEmployerId=${encodeURIComponent(employerId)}`);
}

export async function viewCandidateByAdminAction(formData: FormData) {
  await requireOperationalAdminUser();
  const candidateId = getString(formData, "candidateId");
  redirect(`/admin/candidatos?candidateId=${encodeURIComponent(candidateId)}`);
}

export async function updateCandidateByAdminAction(formData: FormData) {
  const admin = await requireOperationalAdminUser();
  const candidateId = getString(formData, "candidateId");
  try {
    await updateManagedCandidate(admin.id, admin.role, {
      candidateId,
      fullName: getString(formData, "fullName"),
      email: getString(formData, "email"),
      phone: getString(formData, "phone"),
      city: getString(formData, "city"),
      state: getString(formData, "state"),
      desiredRole: getString(formData, "desiredRole"),
      summary: getString(formData, "summary"),
      experience: getString(formData, "experience"),
      education: getString(formData, "education"),
      references: getString(formData, "references")
    });
  } catch (error) {
    redirect(`/admin/candidatos?editCandidateId=${encodeURIComponent(candidateId)}&error=${errorParam(toFriendlyError(error))}`);
  }

  redirect(`/admin/candidatos?candidateId=${encodeURIComponent(candidateId)}&candidateUpdated=1`);
}

export async function inactivateCandidateByAdminAction(formData: FormData) {
  const admin = await requireOperationalAdminUser();
  try {
    await inactivateManagedCandidate(admin.id, admin.role, {
      candidateId: getString(formData, "candidateId")
    });
  } catch (error) {
    redirect(`/admin/candidatos?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/candidatos?candidateInactivated=1");
}

export async function reactivateCandidateByAdminAction(formData: FormData) {
  const admin = await requireOperationalAdminUser();
  try {
    await reactivateManagedCandidate(admin.id, admin.role, {
      candidateId: getString(formData, "candidateId")
    });
  } catch (error) {
    redirect(`/admin/candidatos?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/candidatos?candidateReactivated=1");
}

export async function anonymizeCandidateByAdminAction(formData: FormData) {
  const admin = await requireOperationalAdminUser();
  try {
    await anonymizeManagedCandidate(admin.id, admin.role, {
      candidateId: getString(formData, "candidateId")
    });
  } catch (error) {
    redirect(`/admin/candidatos?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/candidatos?candidateAnonymized=1");
}

export async function blockEmployerAction(formData: FormData) {
  const admin = await requireOperationalAdminUser();
  try {
    await blockManagedEmployer(admin.id, {
      employerId: getString(formData, "employerId")
    });
  } catch (error) {
    redirect(`/admin/empregadores?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/empregadores?employerBlocked=1");
}

export async function unblockEmployerAction(formData: FormData) {
  const admin = await requireOperationalAdminUser();
  try {
    await unblockManagedEmployer(admin.id, {
      employerId: getString(formData, "employerId")
    });
  } catch (error) {
    redirect(`/admin/empregadores?error=${errorParam(toFriendlyError(error))}`);
  }

  redirect("/admin/empregadores?employerUnblocked=1");
}

export async function updateEmployerAction(formData: FormData) {
  const admin = await requireOperationalAdminUser();
  const employerId = getString(formData, "employerId");
  try {
    await updateManagedEmployer(admin.id, {
      employerId,
      companyName: getString(formData, "companyName"),
      contactName: getString(formData, "contactName"),
      document: getString(formData, "document"),
      email: getString(formData, "email")
    });
  } catch (error) {
    redirect(`/admin/empregadores?viewEmployerId=${encodeURIComponent(employerId)}&error=${errorParam(toFriendlyError(error))}`);
  }

  redirect(`/admin/empregadores?viewEmployerId=${encodeURIComponent(employerId)}&updated=1`);
}
