import crypto from "crypto";
import { cookies } from "next/headers";
import {
  deleteSessionById,
  deleteSessionByTokenHash,
  findSafeSessionByTokenHash,
  insertSession
} from "./repository";

const SESSION_COOKIE = "bc_session";
const SESSION_DAYS = 7;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSecureSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await insertSession({
    tokenHash: hashToken(token),
    userId,
    expiresAt
  });

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function destroySecureSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await deleteSessionByTokenHash(hashToken(token));
  }
  cookies().delete(SESSION_COOKIE);
}

export async function getSafeSessionUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await findSafeSessionByTokenHash(hashToken(token));

  if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
    if (session) {
      await deleteSessionById(session.id);
    }
    return null;
  }

  return session.user;
}
