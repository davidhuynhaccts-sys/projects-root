import { Redis } from "@upstash/redis";

export type PeriodKind = "period" | "spotting" | "light" | "medium" | "heavy";
export type PillStatus = "taken" | "missed";
export type MedicationHistoryItem = {
  name: string;
  startDate?: string;
  endDate?: string;
};
export type Profile = {
  name: string;
  birthday?: string;
  heightInches?: number;
  weightLb?: number;
  sprintecStartDate?: string;
  currentMedication?: string;
  continuousPillMode?: boolean;
  regimenModeChangedAt?: string;
  medicationHistory?: MedicationHistoryItem[];
};
export type PebblesState = {
  profile: Profile;
  periods: Record<string, PeriodKind>;
  noPeriods: Record<string, boolean>;
  pills: Record<string, PillStatus>;
  poops: Record<string, boolean>;
  updatedAt: number;
};

const EMPTY_STATE: PebblesState = {
  profile: { name: "Elly", currentMedication: "Mili", continuousPillMode: true },
  periods: {},
  noPeriods: {},
  pills: {},
  poops: {},
  updatedAt: 0,
};

function normalizeProfile(profile?: Profile | null): Profile {
  const base = profile || EMPTY_STATE.profile;
  const medicationHistory = base.medicationHistory?.length
    ? base.medicationHistory
    : base.sprintecStartDate
      ? [{ name: "Sprintec", startDate: base.sprintecStartDate }, { name: "Mili" }]
      : [{ name: "Mili" }];
  return {
    ...base,
    name: base.name || "Elly",
    currentMedication: base.currentMedication || "Mili",
    continuousPillMode: base.continuousPillMode ?? true,
    medicationHistory,
  };
}

function redisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

let memoryState: PebblesState = EMPTY_STATE;

export async function getState(): Promise<PebblesState> {
  const redis = redisClient();
  if (!redis) return { ...memoryState, profile: normalizeProfile(memoryState.profile) };
  const [profile, periods, noPeriods, pills, poops, meta] = await Promise.all([
    redis.get<Profile>("pebbles:profile"),
    redis.get<Record<string, PeriodKind>>("pebbles:periods"),
    redis.get<Record<string, boolean>>("pebbles:noPeriods"),
    redis.get<Record<string, PillStatus>>("pebbles:pills"),
    redis.get<Record<string, boolean>>("pebbles:poops"),
    redis.get<{ updatedAt: number }>("pebbles:meta"),
  ]);
  return {
    profile: normalizeProfile(profile),
    periods: periods || {},
    noPeriods: noPeriods || {},
    pills: pills || {},
    poops: poops || {},
    updatedAt: meta?.updatedAt || 0,
  };
}

export async function saveState(input: PebblesState): Promise<PebblesState> {
  const clean: PebblesState = {
    profile: normalizeProfile(input.profile),
    periods: input.periods || {},
    noPeriods: input.noPeriods || {},
    pills: input.pills || {},
    poops: input.poops || {},
    updatedAt: Date.now(),
  };
  const redis = redisClient();
  if (!redis) {
    memoryState = clean;
    return clean;
  }
  await Promise.all([
    redis.set("pebbles:profile", clean.profile),
    redis.set("pebbles:periods", clean.periods),
    redis.set("pebbles:noPeriods", clean.noPeriods),
    redis.set("pebbles:pills", clean.pills),
    redis.set("pebbles:poops", clean.poops),
    redis.set("pebbles:meta", { updatedAt: clean.updatedAt }),
  ]);
  return clean;
}
