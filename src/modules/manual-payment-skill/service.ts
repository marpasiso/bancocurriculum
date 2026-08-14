import { recordAuditLog } from "@/modules/audit-log-skill/service";
import { activateManualSubscription } from "@/modules/subscription-gate-skill/service";
import { createPixBrCode, hasValidPixCrc } from "./pix-br-code";
import { insertManualPixPayment, insertPaidManualPixPayment } from "./repository";
import { confirmManualPixSchema, manualPaymentSchema, manualPixQrSchema } from "./validations";
import QRCode from "qrcode";

function assertPositiveAmount(amountCents: number) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("Informe um valor de assinatura maior que zero.");
  }
}

export async function createManualSubscriptionPayment(adminUserId: string, input: unknown) {
  const data = manualPaymentSchema.parse(input);
  assertPositiveAmount(data.amountCents);
  const payment = await insertManualPixPayment(adminUserId, data);

  await recordAuditLog({
    userId: adminUserId,
    action: "MANUAL_PIX_PAYMENT_CREATED",
    entity: "Payment",
    entityId: payment.id,
    metadata: { employerId: payment.employerId, amountCents: payment.amountCents }
  });

  return payment;
}

export async function generateManualPixQr(input: unknown) {
  const data = manualPixQrSchema.parse(input);
  assertPositiveAmount(data.amountCents);
  const payload = createPixBrCode({
    pixKey: data.pixKey,
    receiverName: data.receiverName,
    receiverCity: data.receiverCity,
    amountCents: data.amountCents,
    description: data.description
  });
  const qrCodeDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 260
  });

  return { ...data, payload, qrCodeDataUrl };
}

export async function confirmManualPixPaymentReceived(adminUserId: string, input: unknown) {
  const data = confirmManualPixSchema.parse(input);
  assertPositiveAmount(data.amountCents);
  if (!hasValidPixCrc(data.payload)) {
    throw new Error("Código Pix inválido. Gere a cobrança novamente antes de confirmar o pagamento.");
  }

  const payment = await insertPaidManualPixPayment(adminUserId, {
    employerId: data.employerId,
    amountCents: data.amountCents,
    pixCode: data.payload,
    note: data.description
  });

  await recordAuditLog({
    userId: adminUserId,
    action: "MANUAL_PIX_PAYMENT_CREATED",
    entity: "Payment",
    entityId: payment.id,
    metadata: {
      employerId: payment.employerId,
      amountCents: payment.amountCents,
      provider: "manual_pix",
      status: "PAID"
    }
  });

  const subscription = await activateManualSubscription({
    adminUserId,
    employerId: data.employerId,
    paymentId: payment.id
  });

  return { payment, subscription };
}
