import type { CommissionStatus, Prisma } from "@prisma/client";

export type GenerateDeveloperCommissionInput = {
  paymentId: string;
  employerId: string;
  grossAmountCents: number;
  notes?: string;
};

export type MarkDeveloperCommissionPaidInput = {
  commissionId: string;
  notes?: string;
};

export type CancelDeveloperCommissionInput = {
  paymentId: string;
  notes?: string;
};

export type OperationalRepassePeriodInput = {
  periodStart: string;
  periodEnd: string;
};

export type ConfirmOperationalRepasseInput = Partial<OperationalRepassePeriodInput> & {
  payload: string;
};

export type DeveloperCommissionSummary = {
  confirmedPayments: number;
  totalGenerated: number;
  pendingCommission: number;
  paidCommission: number;
  currentMonthGenerated: number;
  currentMonthPending: number;
};

export type DeveloperCommissionListItem = {
  id: string;
  paymentId: string;
  employerId: string;
  employerName: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: CommissionStatus;
  generatedAt: Date;
  paidAt: Date | null;
  notes: string | null;
};

export type CreateDeveloperCommissionData = {
  paymentId: string;
  employerId: string;
  grossAmount: Prisma.Decimal | string;
  commissionRate: Prisma.Decimal | string;
  commissionAmount: Prisma.Decimal | string;
  notes?: string;
};
