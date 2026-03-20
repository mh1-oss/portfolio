import crypto from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, DEFAULT_ADMIN_ACCESS_KEY } from "@/lib/constants";

function getAdminAccessKey() {
  return process.env.ADMIN_ACCESS_KEY || DEFAULT_ADMIN_ACCESS_KEY;
}

function getSessionFingerprint() {
  return crypto.createHash("sha256").update(getAdminAccessKey()).digest("hex");
}

export function isValidAdminKey(key) {
  return key === getAdminAccessKey();
}

export async function createAdminSession() {
  const store = await cookies();

  store.set(ADMIN_COOKIE_NAME, getSessionFingerprint(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
}

export async function requireAdminSession() {
  const store = await cookies();
  const cookieValue = store.get(ADMIN_COOKIE_NAME)?.value;

  return cookieValue === getSessionFingerprint();
}
