import type { LgpdRequestType } from "@prisma/client";

export type DataRequestInput = {
  type: LgpdRequestType;
  fullName: string;
  email: string;
  description: string;
};
