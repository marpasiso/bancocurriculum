import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/modules/audit-log-skill/service";
import {
  createSubscriptionFromPayment,
  findActiveSubscription,
  findEmployerAccessStatus,
  hasSubscriptionHistory,
  findPaymentForActivation,
  markPaymentUsed
} from "./repository";
import { SUBSCRIPTION_DAYS, subscriptionActivationSchema } from "./validations";

export async function getActiveSubscription(employerId: string) {
  return findActiveSubscription(employerId);
}

export async function getEmployerSubscriptionNotice(employerId: string) {
  const [employer, subscription, hasHistory] = await Promise.all([
    findEmployerAccessStatus(employerId),
    findActiveSubscription(employerId),
    hasSubscriptionHistory(employerId)
  ]);
  if (!employer || !employer.isActive) {
    return { shouldShow: true, hasHistory };
  }

  return { shouldShow: !subscription, hasHistory };
}

export async function ensureEmployerCanAccessCandidates(employerId: string) {
  const employer = await findEmployerAccessStatus(employerId);
  if (!employer || !employer.isActive) {
    throw new Error("Empregador inativo.");
  }

  const subscription = await findActiveSubscription(employerId);
  if (!subscription) {
    throw new Error("Assinatura ativa obrigatoria.");
  }

  return subscription;
}

export async function activateManualSubscription(input: unknown) {
  const data = subscriptionActivationSchema.parse(input);
  const payment = await findPaymentForActivation(data.employerId, data.paymentId);

  if (!payment) {
    throw new Error("Pagamento inexistente para este empregador.");
  }

  if (payment.status !== "RECORDED" && payment.status !== "PAID") {
    throw new Error("Pagamento ja utilizado.");
  }

  if (!Number.isInteger(payment.amountCents) || payment.amountCents <= 0) {
    throw new Error("A assinatura manual exige pagamento confirmado com valor maior que zero.");
  }

  const existingSubscription = await prisma.subscription.findUnique({
    where: { paymentId: data.paymentId }
  });
  if (existingSubscription) {
    throw new Error("Pagamento ja possui assinatura vinculada.");
  }

  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000);

  const subscription = await prisma.$transaction(async (tx) => {
    const created = await createSubscriptionFromPayment(tx, {
      employerId: data.employerId,
      paymentId: data.paymentId,
      startsAt,
      endsAt,
      createdById: data.adminUserId
    });

    if (payment.status === "RECORDED") {
      await markPaymentUsed(tx, data.paymentId);
    }

    return created;
  });

  await recordAuditLog({
    userId: data.adminUserId,
    action: "SUBSCRIPTION_ACTIVATED_7_DAYS",
    entity: "Subscription",
    entityId: subscription.id,
    metadata: { employerId: data.employerId, paymentId: data.paymentId }
  });

  return subscription;
}
