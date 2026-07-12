import type { CommissionStatus, LgpdRequestType, PaymentStatus, UserRole } from "@prisma/client";

const paymentStatusLabels: Record<PaymentStatus, string> = {
  RECORDED: "Registrado",
  PAID: "Pago",
  USED: "Utilizado"
};

const commissionStatusLabels: Record<CommissionStatus, string> = {
  PENDING: "Pendente",
  PAID: "Paga",
  CANCELED: "Cancelada"
};

const lgpdRequestTypeLabels: Record<LgpdRequestType, string> = {
  ACCESS: "Acesso aos dados",
  CORRECTION: "Correção de dados",
  DELETE_REVIEW: "Análise de exclusão",
  REVOCATION: "Revogação de consentimento"
};

const userRoleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  EMPLOYER: "Empregador",
  SUPER_ADMIN: "Administrador principal",
  FINANCE_OWNER: "Responsável financeiro"
};

export function formatPaymentStatus(status: PaymentStatus) {
  return paymentStatusLabels[status] ?? status;
}

export function formatCommissionStatus(status: CommissionStatus) {
  return commissionStatusLabels[status] ?? status;
}

export function formatLgpdRequestType(type: LgpdRequestType) {
  return lgpdRequestTypeLabels[type] ?? type;
}

export function formatLgpdRequestStatus(status: "PENDING" | "IN_REVIEW" | "COMPLETED" | "REJECTED") {
  const labels = {
    PENDING: "Pendente",
    IN_REVIEW: "Em análise",
    COMPLETED: "Concluída",
    REJECTED: "Rejeitada"
  };

  return labels[status] ?? status;
}

export function formatUserRole(role: UserRole) {
  return userRoleLabels[role] ?? role;
}
