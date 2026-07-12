import { CommissionStatus, Prisma } from "@prisma/client";
import { recordAuditLog } from "@/modules/audit-log-skill/service";
import { createPixBrCode, hasValidPixCrc } from "@/modules/manual-payment-skill/pix-br-code";
import {
  getFinancialSettings,
  getOperationalCommissionRate,
  hasOperationalRepassePixSettings,
  saveOperationalRepasseSettings
} from "@/modules/settings/operational-settings.skill";
import {
  cancelDeveloperCommissionByPaymentId,
  findDeveloperCommissionByPaymentId,
  insertDeveloperCommission,
  listDeveloperCommissions,
  markDeveloperCommissionAsPaid
} from "./repository";
import type {
  CancelDeveloperCommissionInput,
  ConfirmOperationalRepasseInput,
  DeveloperCommissionListItem,
  DeveloperCommissionSummary,
  GenerateDeveloperCommissionInput,
  MarkDeveloperCommissionPaidInput,
  OperationalRepassePeriodInput
} from "./types";
import {
  cancelDeveloperCommissionSchema,
  confirmOperationalRepasseSchema,
  generateDeveloperCommissionSchema,
  markDeveloperCommissionPaidSchema,
  operationalRepassePeriodSchema
} from "./validations";
import QRCode from "qrcode";

function moneyFromCents(cents: number) {
  return (cents / 100).toFixed(2);
}

function decimalToNumber(value: Prisma.Decimal | number | string) {
  return Number(value);
}

function currentMonthRange() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
  };
}

function defaultPeriod() {
  const { start, end } = currentMonthRange();
  const periodEnd = new Date(end.getTime() - 1);

  return {
    periodStart: start.toISOString().slice(0, 10),
    periodEnd: periodEnd.toISOString().slice(0, 10)
  };
}

function toPeriodRange(input: OperationalRepassePeriodInput) {
  const data = operationalRepassePeriodSchema.parse(input);
  return {
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
    start: new Date(`${data.periodStart}T00:00:00`),
    end: new Date(`${data.periodEnd}T23:59:59.999`)
  };
}

function toCents(value: Prisma.Decimal | number | string) {
  return Math.round(Number(value) * 100);
}

export async function generateDeveloperCommissionForPayment(
  input: GenerateDeveloperCommissionInput,
  actorUserId?: string
) {
  const data = generateDeveloperCommissionSchema.parse(input);
  const existingCommission = await findDeveloperCommissionByPaymentId(data.paymentId);

  if (existingCommission) {
    return existingCommission;
  }

  const commissionRate = await getOperationalCommissionRate();
  const commissionAmountCents = Math.round(data.grossAmountCents * (commissionRate / 100));
  const commission = await insertDeveloperCommission({
    paymentId: data.paymentId,
    employerId: data.employerId,
    grossAmount: moneyFromCents(data.grossAmountCents),
    commissionRate: commissionRate.toFixed(2),
    commissionAmount: moneyFromCents(commissionAmountCents),
    notes: data.notes
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "DEVELOPER_COMMISSION_CREATED",
    entity: "DeveloperCommission",
    entityId: commission.id,
    metadata: {
      paymentId: commission.paymentId,
      employerId: commission.employerId,
      grossAmount: commission.grossAmount.toString(),
      commissionRate: commission.commissionRate.toString(),
      commissionAmount: commission.commissionAmount.toString()
    }
  });

  return commission;
}

export async function getOwnerCommissionDashboard() {
  const commissions = await listDeveloperCommissions();
  const { start, end } = currentMonthRange();

  const summary = commissions.reduce<DeveloperCommissionSummary>(
    (totals, commission) => {
      if (commission.status === CommissionStatus.CANCELED) {
        return totals;
      }

      const commissionAmount = decimalToNumber(commission.commissionAmount);
      const isCurrentMonth = commission.generatedAt >= start && commission.generatedAt < end;

      totals.confirmedPayments += 1;
      totals.totalGenerated += commissionAmount;

      if (commission.status === CommissionStatus.PENDING) {
        totals.pendingCommission += commissionAmount;
      }

      if (commission.status === CommissionStatus.PAID) {
        totals.paidCommission += commissionAmount;
      }

      if (isCurrentMonth) {
        totals.currentMonthGenerated += commissionAmount;
        if (commission.status === CommissionStatus.PENDING) {
          totals.currentMonthPending += commissionAmount;
        }
      }

      return totals;
    },
    {
      confirmedPayments: 0,
      totalGenerated: 0,
      pendingCommission: 0,
      paidCommission: 0,
      currentMonthGenerated: 0,
      currentMonthPending: 0
    }
  );

  const items: DeveloperCommissionListItem[] = commissions.map((commission) => ({
    id: commission.id,
    paymentId: commission.paymentId,
    employerId: commission.employerId,
    employerName: commission.employer.companyName,
    grossAmount: decimalToNumber(commission.grossAmount),
    commissionRate: decimalToNumber(commission.commissionRate),
    commissionAmount: decimalToNumber(commission.commissionAmount),
    status: commission.status,
    generatedAt: commission.generatedAt,
    paidAt: commission.paidAt,
    notes: commission.notes
  }));

  return { summary, commissions: items };
}

export async function getOperationalRepasseSettings() {
  return getFinancialSettings();
}

export async function updateOperationalRepasseSettings(ownerUserId: string, input: unknown) {
  return saveOperationalRepasseSettings(ownerUserId, input);
}

export async function getOperationalRepassePixPreview(_input?: Partial<OperationalRepassePeriodInput>) {
  const settings = await getFinancialSettings();
  const amountCents = toCents(settings.maintenancePlanValue);
  const description = settings.maintenancePlanName.slice(0, 72);

  if (!hasOperationalRepassePixSettings(settings)) {
    return {
      settings,
      amountCents,
      description,
      payload: "",
      qrCodeDataUrl: "",
      pixConfigured: false
    };
  }

  if (amountCents <= 0) {
    return {
      settings,
      amountCents,
      description,
      payload: "",
      qrCodeDataUrl: "",
      pixConfigured: true
    };
  }

  const payload = createPixBrCode({
    pixKey: settings.operationalPixKey,
    receiverName: settings.operationalPixReceiverName,
    receiverCity: settings.operationalPixReceiverCity,
    amountCents,
    description
  });
  const qrCodeDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 260
  });

  return {
    settings,
    amountCents,
    description,
    payload,
    qrCodeDataUrl,
    pixConfigured: true
  };
}

export async function markCommissionPaid(
  ownerUserId: string,
  input: MarkDeveloperCommissionPaidInput
) {
  const data = markDeveloperCommissionPaidSchema.parse(input);
  const commission = await markDeveloperCommissionAsPaid(data.commissionId, data.notes);

  await recordAuditLog({
    userId: ownerUserId,
    action: "DEVELOPER_COMMISSION_PAID",
    entity: "DeveloperCommission",
    entityId: commission.id,
    metadata: {
      paymentId: commission.paymentId,
      employerId: commission.employerId,
      commissionAmount: commission.commissionAmount.toString()
    }
  });

  return commission;
}

export async function confirmOperationalRepassePaid(
  ownerUserId: string,
  input: ConfirmOperationalRepasseInput
) {
  const data = confirmOperationalRepasseSchema.parse(input);
  if (!hasValidPixCrc(data.payload)) {
    throw new Error("Código Pix inválido. Gere o repasse novamente antes de confirmar.");
  }

  const preview = await getOperationalRepassePixPreview(data);
  if (!preview.payload || preview.payload !== data.payload) {
    throw new Error("Os dados do plano foram alterados. Gere o Pix novamente antes de confirmar.");
  }

  await saveOperationalRepasseSettings(ownerUserId, {
    maintenancePlanName: preview.settings.maintenancePlanName,
    maintenancePlanType: preview.settings.maintenancePlanType,
    maintenancePlanValue: preview.settings.maintenancePlanValue,
    maintenancePlanDueDate: preview.settings.maintenancePlanDueDate,
    maintenancePlanStatus: "ACTIVE",
    maintenancePlanNotes: preview.settings.maintenancePlanNotes,
    operationalPixKey: preview.settings.operationalPixKey,
    operationalPixReceiverName: preview.settings.operationalPixReceiverName,
    operationalPixReceiverCity: preview.settings.operationalPixReceiverCity
  });

  await recordAuditLog({
    userId: ownerUserId,
    action: "MAINTENANCE_PLAN_PAYMENT_CONFIRMED",
    entity: "SystemSetting",
    metadata: {
      planName: preview.settings.maintenancePlanName,
      planType: preview.settings.maintenancePlanType,
      dueDate: preview.settings.maintenancePlanDueDate,
      amountCents: preview.amountCents,
      status: "ACTIVE"
    }
  });

  return { status: "ACTIVE", amountCents: preview.amountCents };
}

export async function cancelCommissionForPayment(
  actorUserId: string,
  input: CancelDeveloperCommissionInput
) {
  const data = cancelDeveloperCommissionSchema.parse(input);
  const commission = await cancelDeveloperCommissionByPaymentId(data.paymentId, data.notes);

  await recordAuditLog({
    userId: actorUserId,
    action: "DEVELOPER_COMMISSION_CANCELED",
    entity: "DeveloperCommission",
    entityId: commission.id,
    metadata: {
      paymentId: commission.paymentId,
      employerId: commission.employerId
    }
  });

  return commission;
}

export async function recordCommissionRateChangeAudit(input: {
  actorUserId: string;
  previousRate: number;
  nextRate: number;
}) {
  return recordAuditLog({
    userId: input.actorUserId,
    action: "DEVELOPER_COMMISSION_RATE_CHANGED",
    entity: "DeveloperCommission",
    metadata: {
      previousRate: input.previousRate,
      nextRate: input.nextRate
    }
  });
}
