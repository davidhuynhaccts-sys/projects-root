import crypto from "node:crypto";
import type { NextRequest } from "next/server";

const PASSCODE_HASH = "69386f45cbc86877c2959251ba5ff35bd7865b6b10adb1cbd7ffbab39dccb836";

function secretSeed() {
  const secret = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!secret) throw new Error("Ding auth requires the existing Redis secret.");
  return secret;
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function authCookieValue() {
  return sha256(`${secretSeed()}|ding-auth-v1`);
}

export function checkPasscode(passcode: string) {
  return safeEqual(sha256(passcode), PASSCODE_HASH);
}

export function isAuthorized(request: NextRequest) {
  const cookie = request.cookies.get("ding_auth")?.value || "";
  if (!cookie) return false;
  try {
    return safeEqual(cookie, authCookieValue());
  } catch {
    return false;
  }
}
