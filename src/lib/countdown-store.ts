import { createDefaultStyle, createInitialAppState } from "./countdown-defaults";
import type {
  AppState,
  ComputedSlipState,
  CountdownEvent,
  SlipStyleConfig,
} from "./countdown-types";

const STORAGE_KEY = "slipday_app_state_v1";

export function loadAppState(): AppState {
  if (typeof window === "undefined") {
    return createInitialAppState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialAppState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed || !Array.isArray(parsed.events)) {
      return createInitialAppState();
    }
    const fallback = createInitialAppState();
    return {
      events: parsed.events,
      activeEventId:
        typeof parsed.activeEventId === "string"
          ? parsed.activeEventId
          : (parsed.events[0]?.id ?? ""),
      globalStyle: parsed.globalStyle ?? fallback.globalStyle,
      presets: Array.isArray(parsed.presets) ? parsed.presets : fallback.presets,
      tearHistory: Array.isArray(parsed.tearHistory) ? parsed.tearHistory : [],
    };
  } catch {
    return createInitialAppState();
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function exportStyleJson(style: SlipStyleConfig, name: string): string {
  return JSON.stringify(
    {
      schema: "slipday.style.v1",
      exportedAt: new Date().toISOString(),
      name,
      style,
    },
    null,
    2,
  );
}

export function parseImportedStyleJson(raw: string): { name: string; style: SlipStyleConfig } {
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const candidate =
    parsed["style"] && typeof parsed["style"] === "object"
      ? (parsed["style"] as Partial<SlipStyleConfig>)
      : (parsed as Partial<SlipStyleConfig>);

  if (!candidate.typography || !candidate.surface || !candidate.layout) {
    throw new Error("JSON must include typography, surface, and layout sections.");
  }

  const defaults = createDefaultStyle();
  const merged: SlipStyleConfig = {
    typography: { ...defaults.typography, ...candidate.typography },
    surface: { ...defaults.surface, ...candidate.surface },
    layout: { ...defaults.layout, ...candidate.layout },
  };
  const name =
    typeof parsed["name"] === "string" && parsed["name"].trim().length > 0
      ? parsed["name"].trim()
      : "Imported Style";

  return { name, style: merged };
}

export function buildNativeWidgetPayload(
  event: CountdownEvent,
  style: SlipStyleConfig,
  computed: ComputedSlipState,
): string {
  return JSON.stringify(
    {
      schema: "slipday.native-widget.v1",
      event: {
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        targetDate: event.targetDate,
        currentSlipDate: event.currentSlipDate,
        unit: event.rules.unit,
        plainNumber: event.rules.plainNumber,
        prefix: event.rules.prefix,
        suffix: event.rules.suffix,
        progressMode: event.rules.progressMode,
      },
      snapshot: {
        formattedCountdown: computed.formattedCountdown,
        remainingDays: computed.remainingDays,
        elapsedPct: computed.elapsedPct,
        remainingPct: computed.remainingPct,
        sequenceNumber: computed.sequenceNumber,
        isMonthlyMilestone: computed.isMonthlyMilestone,
        isFinalWindow: computed.isFinalWindow,
      },
      style,
      widgetSizes: {
        small: { cols: 2, rows: 2, showProgress: true, showDate: false },
        medium: { cols: 4, rows: 2, showProgress: true, showDate: true },
        large: { cols: 4, rows: 4, showProgress: true, showDate: true, showSequence: true },
      },
    },
    null,
    2,
  );
}