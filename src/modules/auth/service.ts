import { loginUser, registerEmployerAccount } from "@/modules/employer-auth-skill/service";
import { requireAdminUser, requireEmployerUser } from "@/modules/security-skill/permissions";

export async function registerEmployer(input: unknown) {
  await registerEmployerAccount(input);
}

export async function login(input: unknown) {
  return loginUser(input);
}

export async function requireAdmin() {
  return requireAdminUser();
}

export async function requireEmployer() {
  return requireEmployerUser();
}
