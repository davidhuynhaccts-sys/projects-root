import crypto from "node:crypto";
import webpush from "web-push";
import type { DingPushSubscription } from "./store";

function secretSeed() {
  const secret =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN;
  if (!secret) throw new Error("Ding push requires the existing Redis secret.");
  return secret;
}

function keys() {
  const privateBytes = crypto
    .createHash("sha256")
    .update(`${secretSeed()}|ding-vapid-v1`)
    .digest();

  const ecdh = crypto.createECDH("prime256v1");
  ecdh.setPrivateKey(privateBytes);
  const publicBytes = ecdh.getPublicKey(undefined, "uncompressed");

  return {
    privateKey: privateBytes.toString("base64url"),
    publicKey: publicBytes.toString("base64url"),
  };
}

export function getVapidPublicKey() {
  return keys().publicKey;
}

export async function sendPush(subscription: DingPushSubscription, payload: object) {
  const { publicKey, privateKey } = keys();
  webpush.setVapidDetails(
    "mailto:ding@projectsproject.com",
    publicKey,
    privateKey
  );
  return webpush.sendNotification(subscription as any, JSON.stringify(payload));
}
