import { Redis } from "@upstash/redis";

export type BridgeResult = {
  temperature: "calm" | "tense" | "hot";
  summary: string;
  phuc: string;
  erica: string;
  commonGround: string[];
  unresolved: string[];
  nextStep: string;
  suggestedWords: string;
  pause?: string;
  source?: "ai" | "fallback";
};

export type BridgeRoom = {
  id: string;
  topic: string;
  createdBy: "phuc" | "erica";
  createdAt: string;
  phucToken: string;
  ericaToken: string;
  phucText?: string;
  ericaText?: string;
  phucSubmittedAt?: string;
  ericaSubmittedAt?: string;
  result?: BridgeResult;
};

function redisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const memory = new Map<string, BridgeRoom>();

export async function saveRoom(room: BridgeRoom) {
  const redis = redisClient();
  if (redis) {
    await redis.set(`bridge:room:${room.id}`, room, { ex: 60 * 60 * 24 * 30 });
    return "redis" as const;
  }
  memory.set(room.id, room);
  return "memory" as const;
}

export async function getRoom(id: string) {
  const redis = redisClient();
  if (redis) return (await redis.get<BridgeRoom>(`bridge:room:${id}`)) || null;
  return memory.get(id) || null;
}

export function roleForToken(room: BridgeRoom, token: string | null) {
  if (token && token === room.phucToken) return "phuc" as const;
  if (token && token === room.ericaToken) return "erica" as const;
  return null;
}

export function storageReady() {
  return Boolean((process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) && (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN));
}
