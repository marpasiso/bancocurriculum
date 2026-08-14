export type ManualPaymentInput = {
  employerId: string;
  amountCents: number;
  pixCode: string;
  note?: string;
};

export type ManualPixQrInput = {
  employerId: string;
  amountCents: number;
  pixKey: string;
  receiverName: string;
  receiverCity: string;
  description: string;
};

export type ConfirmManualPixInput = ManualPixQrInput & {
  payload: string;
};
