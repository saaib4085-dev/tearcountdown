import { describe, expect, it } from "vitest";
import { createDefaultRules, createDefaultStyle } from "@/lib/countdown-defaults";
import { computeSlipState, resolveColorTier } from "@/lib/countdown-engine";
import type { CountdownEvent } from "@/lib/countdown-types";

function makeEvent(overrides: Partial<CountdownEvent> = {}): CountdownEvent {
  return {
    id: "test-evt",
    title: "Test Event",
    startDate: "2026-01-01",
    targetDate: "2028-12-08", // 1072 days from 2026-01-01
    currentSlipDate: "2026-01-01",
    archived: false,
    rules: createDefaultRules(),
    useCustomStyle: false,
    style: createDefaultStyle(),
    ...overrides,
  };
}

describe("countdown-engine rules", () => {
  it("formats plain remaining days without prefix or suffix (1072 down to 0)", () => {
    const style = createDefaultStyle();
    const startEvt = makeEvent();
    const res = computeSlipState(startEvt, style);
    expect(res.remainingDays).toBe(1072);
    expect(res.formattedCountdown).toBe("1072");

    const zeroEvt = makeEvent({ currentSlipDate: "2028-12-08" });
    const zeroRes = computeSlipState(zeroEvt, style);
    expect(zeroRes.remainingDays).toBe(0);
    expect(zeroRes.formattedCountdown).toBe("0");
    expect(zeroRes.isCompleted).toBe(true);
  });

  it("applies custom prefix and suffix when plainNumber is disabled", () => {
    const style = createDefaultStyle();
    const evt = makeEvent({
      rules: { ...createDefaultRules(), plainNumber: false, prefix: "T-", suffix: "d" },
    });
    const res = computeSlipState(evt, style);
    expect(res.formattedCountdown).toBe("T-1072d");
  });

  it("calculates elapsed (0.0% -> 100%) and remaining (100% -> 0%) progress accurately", () => {
    const style = createDefaultStyle();
    const evt = makeEvent({
      startDate: "2026-01-01",
      targetDate: "2026-01-11", // 10 total days
      currentSlipDate: "2026-01-04", // 3 elapsed, 7 remaining
    });
    const res = computeSlipState(evt, style);
    expect(res.elapsedPct).toBe(30.0);
    expect(res.remainingPct).toBe(70.0);
    expect(res.sequenceNumber).toBe(4);
  });

  it("computes seconds, minutes, hours, weeks, months, and years countdown units", () => {
    const style = createDefaultStyle();
    const base = {
      startDate: "2026-01-01",
      targetDate: "2026-01-11", // 10 days = 240 hours = 14400 min = 864000 sec
      currentSlipDate: "2026-01-01",
    };

    expect(
      computeSlipState(
        makeEvent({ ...base, rules: { ...createDefaultRules(), unit: "hours" } }),
        style,
      ).rawRemainingValue,
    ).toBe(240);

    expect(
      computeSlipState(
        makeEvent({ ...base, rules: { ...createDefaultRules(), unit: "minutes" } }),
        style,
      ).rawRemainingValue,
    ).toBe(14400);

    expect(
      computeSlipState(
        makeEvent({ ...base, rules: { ...createDefaultRules(), unit: "seconds" } }),
        style,
      ).rawRemainingValue,
    ).toBe(864000);

    expect(
      computeSlipState(
        makeEvent({
          ...base,
          targetDate: "2026-03-12", // 70 days = 10 weeks
          rules: { ...createDefaultRules(), unit: "weeks" },
        }),
        style,
      ).rawRemainingValue,
    ).toBe(10);

    expect(
      computeSlipState(
        makeEvent({
          ...base,
          targetDate: "2027-01-01", // 365 days
          rules: { ...createDefaultRules(), unit: "years" },
        }),
        style,
      ).rawRemainingValue,
    ).toBe(1);
  });

  it("detects monthly milestone day and final N days window", () => {
    const style = createDefaultStyle();
    const evt = makeEvent({
      startDate: "2026-01-01",
      targetDate: "2026-12-15",
      currentSlipDate: "2026-12-01", // 1st of month AND 14 days left (<= 30)
    });
    const res = computeSlipState(evt, style);
    expect(res.isMonthlyMilestone).toBe(true);
    expect(res.isFinalWindow).toBe(true);
  });

  it("resolves the tightest matching color tier by remaining percentage", () => {
    const style = createDefaultStyle();
    const tierMid = resolveColorTier(40, true, style.surface.colorTiers);
    expect(tierMid?.id).toBe("tier-mid");

    const tierFinal = resolveColorTier(10, true, style.surface.colorTiers);
    expect(tierFinal?.id).toBe("tier-final");

    const tierNone = resolveColorTier(80, true, style.surface.colorTiers);
    expect(tierNone).toBeNull();
  });
});