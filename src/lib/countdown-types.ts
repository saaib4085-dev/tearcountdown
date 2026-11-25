export type CountdownUnit =
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "months"
  | "years";

export type ProgressMode = "elapsed" | "remaining" | "both" | "none";

export type BorderStyleOption = "solid" | "dashed" | "double" | "none";
export type TearEdgeStyle = "perforated" | "jagged" | "straight";
export type TearDirection = "down" | "up" | "left" | "right" | "peel";
export type SlipAspectRatio = "portrait" | "tall" | "square" | "classic";

export type TypographyElementKey =
  | "daysRemaining"
  | "progress"
  | "date"
  | "dayOfWeek"
  | "eventName"
  | "sequence"
  | "monthlyMilestone"
  | "finalWindow";

export type FrontFaceElementKey =
  | "eventName"
  | "daysRemaining"
  | "progress"
  | "date"
  | "dayOfWeek"
  | "sequence";

export interface ElementTypography {
  fontFamily: string;
  fontSize: number; // px
  fontWeight: number; // 300-800
  letterSpacing: number; // em (-0.08 to 0.3)
  lineHeight: number; // 0.8 to 2.0
  uppercase: boolean;
  italic: boolean;
}

export interface ColorTier {
  id: string;
  label: string;
  maxRemainingPct: number; // applies when remainingPct <= maxRemainingPct (0..100)
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
}

export interface SurfaceStyle {
  backgroundType: "solid" | "gradient";
  backgroundColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  textColor: string;
  borderColor: string;
  accentColor: string;
  shadowDepth: number; // 0-40
  shadowBlur: number; // 0-60
  glassBlur: number; // 0-24
  grainOpacity: number; // 0-0.35
  tiersEnabled: boolean;
  colorTiers: ColorTier[];
}

export interface LayoutMechanics {
  aspectRatio: SlipAspectRatio;
  padding: number; // px (12-40)
  cornerRadius: number; // px (0-32)
  borderStyle: BorderStyleOption;
  borderWidth: number; // 0-4
  tearEdgeStyle: TearEdgeStyle;
  tearDirection: TearDirection;
  animationSpeedMs: number; // 200-1000
  stackDepth: number; // 0-6
  elementOrder: FrontFaceElementKey[];
  visibleElements: Record<FrontFaceElementKey, boolean>;
}

export interface SlipStyleConfig {
  typography: Record<TypographyElementKey, ElementTypography>;
  surface: SurfaceStyle;
  layout: LayoutMechanics;
}

export interface CountdownRules {
  unit: CountdownUnit;
  plainNumber: boolean;
  prefix: string;
  suffix: string;
  progressMode: ProgressMode;
  monthlyMilestoneEnabled: boolean;
  monthlyMilestoneDay: number; // 1-31
  monthlyMilestoneLabel: string;
  finalWindowEnabled: boolean;
  finalWindowDays: number; // e.g., 30
  finalWindowLabel: string;
}

export interface TearLogEntry {
  id: string;
  eventId: string;
  tornDateIso: string; // YYYY-MM-DD
  remainingAtTear: string;
  tornAtIso: string; // ISO timestamp
  sequenceNumber: number;
}

export interface CountdownEvent {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  currentSlipDate: string; // YYYY-MM-DD (advances when torn off)
  archived: boolean;
  rules: CountdownRules;
  useCustomStyle: boolean;
  style: SlipStyleConfig;
}

export interface StylePreset {
  id: string;
  name: string;
  scope: "global" | "event";
  style: SlipStyleConfig;
}

export interface AppState {
  events: CountdownEvent[];
  activeEventId: string;
  globalStyle: SlipStyleConfig;
  presets: StylePreset[];
  tearHistory: TearLogEntry[];
}

export interface ComputedSlipState {
  rawRemainingValue: number;
  formattedCountdown: string;
  unitLabel: string;
  remainingDays: number;
  totalDays: number;
  elapsedDays: number;
  sequenceNumber: number;
  elapsedPct: number;
  remainingPct: number;
  formattedDate: string;
  dayOfWeek: string;
  isMonthlyMilestone: boolean;
  isFinalWindow: boolean;
  isCompleted: boolean;
  activeTier: ColorTier | null;
}