import { Redis } from "@upstash/redis";

export type DingCategory = { id: string; name: string; color: string; createdAt: number };
export type DingTask = { id: string; text: string; categoryId: string; createdAt: number };
export type DingState = { categories: DingCategory[]; tasks: DingTask[]; updatedAt: number };
export type DingPushSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
};

export type DingSettings = {
  notificationTimes: [string, string];
};

export const DEFAULT_CATEGORIES: DingCategory[] = [
  { id: "work", name: "Work", color: "#007AFF", createdAt: 1 },
  { id: "shopping", name: "Shopping", color: "#34C759", createdAt: 2 },
  { id: "elly", name: "Elly", color: "#AF52DE", createdAt: 3 },
  { id: "home", name: "Home", color: "#FF9500", createdAt: 4 },
];

function redisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

let memoryState: DingState | null = null;
let memorySubscription: DingPushSubscription | null = null;
let memorySettings: DingSettings = { notificationTimes: ["07:00", "14:30"] };
const memorySent = new Set<string>();

export async function getState() {
  const redis = redisClient();
  const state = redis
    ? await redis.get<DingState>("ding:state")
    : memoryState;
  return {
    exists: Boolean(state),
    state: state || { categories: DEFAULT_CATEGORIES, tasks: [], updatedAt: 0 },
    storage: redis ? "redis" as const : "memory" as const,
  };
}

export async function saveState(state: DingState) {
  const clean: DingState = {
    categories: Array.isArray(state.categories) && state.categories.length ? state.categories : DEFAULT_CATEGORIES,
    tasks: Array.isArray(state.tasks) ? state.tasks : [],
    updatedAt: Date.now(),
  };
  const redis = redisClient();
  if (redis) await redis.set("ding:state", clean);
  else memoryState = clean;
  return clean;
}

export async function getPushSubscription() {
  const redis = redisClient();
  if (redis) return (await redis.get<DingPushSubscription>("ding:push:subscription")) || null;
  return memorySubscription;
}

export async function savePushSubscription(subscription: DingPushSubscription) {
  const redis = redisClient();
  if (redis) await redis.set("ding:push:subscription", subscription);
  else memorySubscription = subscription;
}

export async function deletePushSubscription() {
  const redis = redisClient();
  if (redis) await redis.del("ding:push:subscription");
  else memorySubscription = null;
}

export async function claimDigest(slot: string) {
  const redis = redisClient();
  if (redis) {
    const result = await redis.set(`ding:digest:${slot}`, "sent", { nx: true, ex: 60 * 60 * 30 });
    return result === "OK";
  }
  if (memorySent.has(slot)) return false;
  memorySent.add(slot);
  return true;
}


export async function getSettings() {
  const redis = redisClient();
  if (redis) {
    return (await redis.get<DingSettings>("ding:settings")) || { notificationTimes: ["07:00", "14:30"] };
  }
  return memorySettings;
}

export async function saveSettings(settings: DingSettings) {
  const clean: DingSettings = {
    notificationTimes: settings.notificationTimes,
  };
  const redis = redisClient();
  if (redis) await redis.set("ding:settings", clean);
  else memorySettings = clean;
  return clean;
}
