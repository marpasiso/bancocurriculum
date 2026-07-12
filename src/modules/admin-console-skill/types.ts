export type AdminPaymentFormInput = {
  employerId: string;
  amountCents: number;
  pixCode: string;
  note?: string;
};

export type AdminSubscriptionFormInput = {
  employerId: string;
  paymentId: string;
};

export type AdminPixQrInput = {
  employerId: string;
  amountCents: number;
  pixKey: string;
  receiverName: string;
  receiverCity: string;
  description: string;
};
