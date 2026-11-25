import { addDays, differenceInCalendarDays, format } from "date-fns";
import type {
  ColorTier,
  ComputedSlipState,
  CountdownEvent,
  CountdownUnit,
  SlipStyleConfig,
} from "./countdown-types";

export function parseIsoDate(iso: string): Date {
  const parts = iso.split("-").map(Number);
  const year = parts[0] ?? 2026;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function shiftIsoDate(iso: string, deltaDays: number): string {
  return toIsoDate(addDays(parseIsoDate(iso), deltaDays));
}

export function getTodayIso(): string {
  return toIsoDate(new Date());
}

export function getEffectiveStyle(
  event: CountdownEvent,
  globalStyle: SlipStyleConfig,
): SlipStyleConfig {
  return event.useCustomStyle ? event.style : globalStyle;
}

export const UNIT_LABELS: Record<CountdownUnit, string> = {
  seconds: "sec",
  minutes: "min",
  hours: "hrs",
  days: "days",
  weeks: "wks",
  months: "mos",
  years: "yrs",
};

export function resolveColorTier(
  remainingPct: number,
  tiersEnabled: boolean,
  tiers: ColorTier[],
): ColorTier | null {
  if (!tiersEnabled || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => a.maxRemainingPct - b.maxRemainingPct);
  for (const tier of sorted) {
    if (remainingPct <= tier.maxRemainingPct) {
      return tier;
    }
  }
  return null;
}

export function computeSlipState(
  event: CountdownEvent,
  style: SlipStyleConfig,
  nowMs?: number,
): ComputedSlipState {
  const start = parseIsoDate(event.startDate);
  const target = parseIsoDate(event.targetDate);
  const slip = parseIsoDate(event.currentSlipDate);

  const totalDays = Math.max(1, differenceInCalendarDays(target, start));
  const rawRemainingDays = differenceInCalendarDays(target, slip);
  const remainingDays = Math.max(0, rawRemainingDays);
  const rawElapsed = differenceInCalendarDays(slip, start);
  const elapsedDays = Math.min(totalDays, Math.max(0, rawElapsed));
  const sequenceNumber = Math.max(1, rawElapsed + 1);

  const elapsedPct = Number(((elapsedDays / totalDays) * 100).toFixed(1));
  const remainingPct = Number(Math.max(0, Math.min(100, 100 - elapsedPct)).toFixed(1));

  // For sub-day units, blend slip date with current time-of-day from nowMs so live ticking works
  const referenceNow = nowMs !== undefined ? new Date(nowMs) : new Date(slip.getTime());
  const slipWithTime = new Date(
    slip.getFullYear(),
    slip.getMonth(),
    slip.getDate(),
    nowMs !== undefined ? referenceNow.getHours() : 0,
    nowMs !== undefined ? referenceNow.getMinutes() : 0,
    nowMs !== undefined ? referenceNow.getSeconds() : 0,
  );
  const diffMs = Math.max(0, target.getTime() - slipWithTime.getTime());

  let rawRemainingValue = remainingDays;
  let numString = String(remainingDays);

  switch (event.rules.unit) {
    case "seconds": {
      rawRemainingValue = Math.floor(diffMs / 1000);
      numString = String(rawRemainingValue);
      break;
    }
    case "minutes": {
      rawRemainingValue = Math.floor(diffMs / 60000);
      numString = String(rawRemainingValue);
      break;
    }
    case "hours": {
      rawRemainingValue = Math.floor(diffMs / 3600000);
      numString = String(rawRemainingValue);
      break;
    }
    case "days": {
      rawRemainingValue = remainingDays;
      numString = String(remainingDays);
      break;
    }
    case "weeks": {
      const weeks = remainingDays / 7;
      rawRemainingValue = remainingDays >= 70 ? Math.floor(weeks) : Number(weeks.toFixed(1));
      numString = String(rawRemainingValue);
      break;
    }
    case "months": {
      const months = remainingDays / 30.4375;
      rawRemainingValue = Number(months.toFixed(1));
      numString = String(rawRemainingValue);
      break;
    }
    case "years": {
      const years = remainingDays / 365.25;
      rawRemainingValue = Number(years.toFixed(2));
      numString = String(rawRemainingValue);
      break;
    }
  }

  const formattedCountdown = event.rules.plainNumber
    ? numString
    : `${event.rules.prefix}${numString}${event.rules.suffix}`;

  const isMonthlyMilestone =
    event.rules.monthlyMilestoneEnabled && slip.getDate() === event.rules.monthlyMilestoneDay;
  const isFinalWindow =
    event.rules.finalWindowEnabled &&
    remainingDays > 0 &&
    remainingDays <= event.rules.finalWindowDays;
  const isCompleted = remainingDays === 0 && diffMs === 0;

  const activeTier = resolveColorTier(
    remainingPct,
    style.surface.tiersEnabled,
    style.surface.colorTiers,
  );

  return {
    rawRemainingValue,
    formattedCountdown,
    unitLabel: UNIT_LABELS[event.rules.unit],
    remainingDays,
    totalDays,
    elapsedDays,
    sequenceNumber,
    elapsedPct,
    remainingPct,
    formattedDate: format(slip, "MMM d, yyyy"),
    dayOfWeek: format(slip, "EEEE"),
    isMonthlyMilestone,
    isFinalWindow,
    isCompleted,
    activeTier,
  };
}