import type { UserRole } from "@prisma/client";

export type SafeSessionUser = {
  id: string;
  email: string;
  role: UserRole;
  employer: { id: string; companyName: string; isActive: boolean } | null;
};
