import {
  createSecureSession,
  destroySecureSession,
  getSafeSessionUser
} from "@/modules/security-skill/session";

export async function createSession(userId: string) {
  await createSecureSession(userId);
}

export async function destroySession() {
  await destroySecureSession();
}

export async function getCurrentUser() {
  return getSafeSessionUser();
}
