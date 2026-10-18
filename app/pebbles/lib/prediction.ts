import type { PebblesState, PeriodKind } from "./store";

function dateOnly(value: string) {
  return new Date(value + "T12:00:00");
}
function isoDate(d: Date) {
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
}
function todayInChicago() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find(p => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function addDays(value: string, days: number) {
  const d = dateOnly(value); d.setDate(d.getDate()+days); return isoDate(d);
}
function diffDays(a: string, b: string) {
  return Math.round((dateOnly(b).getTime()-dateOnly(a).getTime())/86400000);
}

const BLEEDING_KINDS = new Set<PeriodKind>(["period","spotting","light","medium","heavy"]);

export function periodStarts(periods: Record<string, PeriodKind>) {
  const dates = Object.keys(periods).filter(d => BLEEDING_KINDS.has(periods[d]) && periods[d] !== "spotting").sort();
  return dates.filter((d,i) => i === 0 || diffDays(dates[i-1], d) > 1);
}

function placeboWindowFromAnchor(anchor: string, today: string) {
  if (today <= anchor) return anchor;
  const elapsed = diffDays(anchor, today);
  const cycles = Math.floor(elapsed / 28);
  const currentStart = addDays(anchor, cycles * 28);
  if (diffDays(currentStart, today) <= 6) return currentStart;
  return addDays(currentStart, 28);
}

function nextPlaceboWeekStart(pillStart: string, today: string, modeChangedAt?: string) {
  // If continuous mode was turned off, finish the current 21-active-pill pack,
  // then use that first placebo week as the new 28-day schedule anchor.
  if (modeChangedAt) {
    const activeDayAtSwitch = ((Math.max(0, diffDays(pillStart, modeChangedAt)) % 21) + 1);
    const firstPlacebo = addDays(modeChangedAt, 22 - activeDayAtSwitch);
    return placeboWindowFromAnchor(firstPlacebo, today);
  }

  // Standard 28-day packs: 21 active pills followed by 7 placebo days.
  const elapsed = Math.max(0, diffDays(pillStart, today));
  const cycleDay = elapsed % 28;
  if (cycleDay < 21) return addDays(today, 21 - cycleDay);
  return addDays(today, -(cycleDay - 21));
}

export function prediction(state: PebblesState) {
  const starts = periodStarts(state.periods);
  const lengths = starts.slice(1).map((d,i) => diffDays(starts[i], d)).filter(n => n >= 15 && n <= 60);
  const recent = lengths.slice(-6);
  const avg = recent.length ? recent.reduce((a,b)=>a+b,0)/recent.length : 28;
  const today = todayInChicago();
  const pillStart = state.profile.sprintecStartDate || null;
  const continuousMode = state.profile.continuousPillMode ?? true;
  const currentMedication = state.profile.currentMedication || "Mili";

  let predicted: string | null = null;
  let projectionIntervalDays: number | null = null;
  let predictedWindowDays = 5;

  if (continuousMode) {
    predicted = null;
  } else if (pillStart) {
    predicted = nextPlaceboWeekStart(pillStart, today, state.profile.regimenModeChangedAt);
    projectionIntervalDays = 28;
    predictedWindowDays = 7;
  } else {
    const cycleDays = Math.round(avg);
    predicted = starts.length ? addDays(starts[starts.length-1], cycleDays) : null;
    projectionIntervalDays = cycleDays;
    let safety = 0;
    while (predicted && state.noPeriods?.[predicted] && safety < 120) {
      predicted = addDays(predicted, 1);
      safety += 1;
    }
  }

  const lastPoop = Object.keys(state.poops).filter(d => state.poops[d]).sort().at(-1) || null;
  const pillDates = Object.keys(state.pills).filter(d => state.pills[d] === "taken").sort();
  const elapsedActiveDays = pillStart ? Math.max(0, diffDays(pillStart, today)) : null;
  const pillDay = elapsedActiveDays == null ? null : continuousMode
    ? (elapsedActiveDays % 21) + 1
    : (elapsedActiveDays % 28) + 1;
  const bleedingToday = state.periods[today];
  const noPeriodToday = Boolean(state.noPeriods?.[today]);

  let note = "Your body can feel a little different from day to day.";
  if (continuousMode) {
    note = bleedingToday
      ? `Logged today: ${bleedingToday === "period" ? "bleeding" : bleedingToday}.`
      : "Continuous pill mode is on. There is no scheduled period to predict.";
  } else if (pillStart) {
    note = noPeriodToday
      ? "No bleeding logged today. The next period estimate follows the placebo week."
      : "Period timing is based on the placebo week rather than the old natural cycle.";
  }

  return {
    starts,
    cycleLengths: lengths,
    averageCycleLength: Math.round(avg * 10) / 10,
    predictedPeriodStart: predicted,
    projectionIntervalDays,
    predictedWindowDays,
    continuousPillMode: continuousMode,
    currentMedication,
    lastPoop,
    pillDay,
    pillTakenToday: state.pills[today] === "taken",
    pillTakenCount: pillDates.length,
    today,
    note,
  };
}
