export type CandidateRegistrationInput = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  systemJobFunctionIds: string[];
  summary: string;
  experience: string;
  education: string;
  references?: string;
  acceptedLgpd: true;
};

export type RequestMetadata = {
  ipAddress?: string;
  userAgent?: string;
};

export type CandidateConsentMetadata = {
  consentAccepted: true;
  consentAcceptedAt: Date;
  consentTextVersion: string;
  consentTextSnapshot: string;
  consentIp?: string;
  consentUserAgent?: string;
};
