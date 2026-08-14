import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/modules/audit-log-skill/service";
import { createPixBrCode } from "@/modules/manual-payment-skill/pix-br-code";
import {
  getFinancialSettings,
  hasSubscriptionPixSettings
} from "@/modules/settings/operational-settings.skill";
import QRCode from "qrcode";
import {
  createSubscriptionFromPayment,
  findActiveSubscription,
  findEmployerAccessStatus,
  findLatestSubscription,
  findPendingSubscriptionPayment,
  findPaymentForActivation,
  findOrCreatePendingSubscriptionPayment,
  markPaymentUsed
} from "./repository";
import { SUBSCRIPTION_DAYS, subscriptionActivationSchema } from "./validations";

export async function getActiveSubscription(employerId: string) {
  return findActiveSubscription(employerId);
}

export async function getEmployerSubscriptionState(employerId: string) {
  const [activeSubscription, latestSubscription, pendingPayment] = await Promise.all([
    findActiveSubscription(employerId),
    findLatestSubscription(employerId),
    findPendingSubscriptionPayment(employerId)
  ]);

  if (activeSubscription) {
    return {
      status: "active" as const,
      activeSubscription,
      latestSubscription,
      pendingPayment: null,
      ctaLabel: "Assinatura ativa",
      message: "Sua assinatura está ativa."
    };
  }

  if (pendingPayment) {
    return {
      status: "pending_payment" as const,
      activeSubscription: null,
      latestSubscription,
      pendingPayment,
      ctaLabel: "Aguardando pagamento",
      message: "Já existe uma cobrança Pix pendente para esta assinatura."
    };
  }

  if (latestSubscription) {
    return {
      status: "expired" as const,
      activeSubscription: null,
      latestSubscription,
      pendingPayment: null,
      ctaLabel: "Renovar assinatura",
      message: "Sua assinatura venceu. Renove para consultar candidatos."
    };
  }

  return {
    status: "new" as const,
    activeSubscription: null,
    latestSubscription: null,
    pendingPayment: null,
    ctaLabel: "Assinar",
    message: "Para consultar candidatos, é necessário ter uma assinatura ativa."
  };
}

export async function getPendingSubscriptionPix(employerId: string) {
  const pendingPayment = await findPendingSubscriptionPayment(employerId);
  if (!pendingPayment) return null;

  const qrCodeDataUrl = await QRCode.toDataURL(pendingPayment.pixCode, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 260
  });

  return { payment: pendingPayment, qrCodeDataUrl };
}

export async function requestEmployerSubscriptionPayment(input: {
  employerId: string;
  userId: string;
}) {
  const currentState = await getEmployerSubscriptionState(input.employerId);

  if (currentState.status === "active" || currentState.pendingPayment) {
    return currentState.pendingPayment;
  }

  const settings = await getFinancialSettings();
  if (!hasSubscriptionPixSettings(settings)) {
    throw new Error("A cobrança Pix ainda não foi configurada pelo administrador.");
  }

  const amountCents = Math.round(Number(settings.subscriptionPaymentAmount) * 100);
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("O valor da assinatura ainda não foi configurado pelo administrador.");
  }

  const description = currentState.status === "expired" ? "Renovação da assinatura" : "Assinatura da plataforma";
  const pixCode = createPixBrCode({
    pixKey: settings.subscriptionPixKey,
    receiverName: settings.subscriptionPixReceiverName,
    receiverCity: settings.subscriptionPixReceiverCity,
    amountCents,
    description
  });

  const result = await findOrCreatePendingSubscriptionPayment({
    employerId: input.employerId,
    amountCents,
    pixCode,
    note: description,
    createdById: input.userId
  });

  if (result.created) {
    await recordAuditLog({
      userId: input.userId,
      action: "EMPLOYER_SUBSCRIPTION_PAYMENT_REQUESTED",
      entity: "Payment",
      entityId: result.payment.id,
      metadata: { employerId: input.employerId, amountCents }
    });
  }

  return result.payment;
}

export async function shouldNotifyInactiveEmployerSubscription(employerId: string) {
  const employer = await findEmployerAccessStatus(employerId);
  if (!employer || !employer.isActive) {
    return true;
  }

  const subscription = await findActiveSubscription(employerId);
  return !subscription;
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

export async function confirmPendingSubscriptionPayment(input: {
  adminUserId: string;
  employerId: string;
  paymentId: string;
}) {
  const data = subscriptionActivationSchema.parse(input);
  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000);

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { id: data.paymentId, employerId: data.employerId, status: "RECORDED" }
    });

    if (!payment) {
      throw new Error("Pagamento pendente não encontrado para este empregador.");
    }

    const existingSubscription = await tx.subscription.findUnique({
      where: { paymentId: payment.id }
    });
    if (existingSubscription) {
      throw new Error("Pagamento já possui assinatura vinculada.");
    }

    const paidPayment = await tx.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paidAt: new Date() }
    });

    const subscription = await createSubscriptionFromPayment(tx, {
      employerId: data.employerId,
      paymentId: payment.id,
      startsAt,
      endsAt,
      createdById: data.adminUserId
    });

    return { payment: paidPayment, subscription };
  });

  await recordAuditLog({
    userId: data.adminUserId,
    action: "MANUAL_PIX_PAYMENT_CONFIRMED",
    entity: "Payment",
    entityId: result.payment.id,
    metadata: {
      employerId: data.employerId,
      amountCents: result.payment.amountCents,
      status: "PAID"
    }
  });

  await recordAuditLog({
    userId: data.adminUserId,
    action: "SUBSCRIPTION_ACTIVATED_7_DAYS",
    entity: "Subscription",
    entityId: result.subscription.id,
    metadata: { employerId: data.employerId, paymentId: result.payment.id }
  });

  return result;
}
