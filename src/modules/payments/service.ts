import { createManualSubscriptionPayment } from "@/modules/manual-payment-skill/service";

export async function createManualPixPayment(adminUserId: string, input: unknown) {
  return createManualSubscriptionPayment(adminUserId, input);
}
