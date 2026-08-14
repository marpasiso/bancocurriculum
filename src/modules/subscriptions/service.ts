import {
  activateManualSubscription,
  ensureEmployerCanAccessCandidates,
  getActiveSubscription as getActiveSubscriptionFromSkill
} from "@/modules/subscription-gate-skill/service";

export async function getActiveSubscription(employerId: string) {
  return getActiveSubscriptionFromSkill(employerId);
}

export async function ensureActiveSubscription(employerId: string) {
  return ensureEmployerCanAccessCandidates(employerId);
}

export async function activateSevenDaySubscription(input: {
  adminUserId: string;
  employerId: string;
  paymentId: string;
}) {
  return activateManualSubscription(input);
}
