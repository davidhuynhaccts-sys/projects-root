import type { PebblesState } from "./store";

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

export function periodStarts(periods: Record<string, "period" | "spotting">) {
  const dates = Object.keys(periods).filter(d => periods[d] === "period").sort();
  return dates.filter((d,i) => i === 0 || diffDays(dates[i-1], d) > 1);
}

export function prediction(state: PebblesState) {
  const starts = periodStarts(state.periods);
  const lengths = starts.slice(1).map((d,i) => diffDays(starts[i], d)).filter(n => n >= 15 && n <= 60);
  const recent = lengths.slice(-6);
  const avg = recent.length ? recent.reduce((a,b)=>a+b,0)/recent.length : 28;
  const predicted = starts.length ? addDays(starts[starts.length-1], Math.round(avg)) : null;
  const today = todayInChicago();
  const lastPoop = Object.keys(state.poops).filter(d => state.poops[d]).sort().at(-1) || null;
  const pillDates = Object.keys(state.pills).filter(d => state.pills[d] === "taken").sort();
  const pillDay = state.profile.sprintecStartDate ? Math.max(0, diffDays(state.profile.sprintecStartDate, today) + 1) : null;
  const spottingToday = state.periods[today] === "spotting";
  let note = "Your body can feel a little different from day to day.";
  if (state.profile.sprintecStartDate) {
    note = spottingToday
      ? "Light spotting can happen while your body is getting used to Sprintec."
      : "Your body is still getting used to Sprintec. You may feel completely normal today.";
    if (predicted && Math.abs(diffDays(today, predicted)) <= 3) {
      note = "This is around when your period used to arrive. Sprintec may change the timing, and light spotting can happen.";
    }
  }
  return {
    starts,
    cycleLengths: lengths,
    averageCycleLength: Math.round(avg * 10) / 10,
    predictedPeriodStart: predicted,
    lastPoop,
    pillDay,
    pillTakenToday: state.pills[today] === "taken",
    pillTakenCount: pillDates.length,
    today,
    note,
  };
}
