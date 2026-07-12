import { z } from "zod";

export const subscriptionActivationSchema = z.object({
  adminUserId: z.string().min(1),
  employerId: z.string().min(1),
  paymentId: z.string().min(1)
});

export const SUBSCRIPTION_DAYS = 7;
