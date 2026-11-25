import type {
  AppState,
  CountdownEvent,
  CountdownRules,
  FrontFaceElementKey,
  SlipStyleConfig,
  StylePreset,
  TypographyElementKey,
} from "./countdown-types";

export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: "Oswald (Poster)", value: '"Oswald", sans-serif' },
  { label: "Instrument Serif", value: '"Instrument Serif", Georgia, serif' },
  { label: "DM Sans", value: '"DM Sans", sans-serif' },
  { label: "Space Grotesk", value: '"Space Grotesk", sans-serif' },
  { label: "IBM Plex Mono", value: '"IBM Plex Mono", monospace' },
  { label: "Fraunces", value: '"Fraunces", Georgia, serif' },
  { label: "Syne", value: '"Syne", sans-serif' },
  { label: "Playfair Display", value: '"Playfair Display", Georgia, serif' },
];

export const TYPOGRAPHY_ELEMENT_LABELS: Record<TypographyElementKey, string> = {
  daysRemaining: "Countdown Value",
  progress: "Progress %",
  date: "Date",
  dayOfWeek: "Day of Week",
  eventName: "Event Name",
  sequence: "Sequence #",
  monthlyMilestone: "Monthly Milestone Mode",
  finalWindow: "Final Window Mode",
};

export const FRONT_FACE_LABELS: Record<FrontFaceElementKey, string> = {
  eventName: "Event Name",
  daysRemaining: "Countdown Value",
  progress: "Progress %",
  date: "Date",
  dayOfWeek: "Day of Week",
  sequence: "Sequence #",
};

export function createDefaultStyle(): SlipStyleConfig {
  return {
    typography: {
      daysRemaining: {
        fontFamily: '"Oswald", sans-serif',
        fontSize: 92,
        fontWeight: 600,
        letterSpacing: -0.03,
        lineHeight: 0.92,
        uppercase: false,
        italic: false,
      },
      progress: {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: 0.06,
        lineHeight: 1.3,
        uppercase: true,
        italic: false,
      },
      date: {
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 22,
        fontWeight: 400,
        letterSpacing: 0.01,
        lineHeight: 1.2,
        uppercase: false,
        italic: false,
      },
      dayOfWeek: {
        fontFamily: '"DM Sans", sans-serif',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.16,
        lineHeight: 1.2,
        uppercase: true,
        italic: false,
      },
      eventName: {
        fontFamily: '"DM Sans", sans-serif',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 0.12,
        lineHeight: 1.25,
        uppercase: true,
        italic: false,
      },
      sequence: {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: 0.08,
        lineHeight: 1.2,
        uppercase: true,
        italic: false,
      },
      monthlyMilestone: {
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 16,
        fontWeight: 400,
        letterSpacing: 0.05,
        lineHeight: 1.2,
        uppercase: false,
        italic: true,
      },
      finalWindow: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.14,
        lineHeight: 1.2,
        uppercase: true,
        italic: false,
      },
    },
    surface: {
      backgroundType: "solid",
      backgroundColor: "#FBF9F4",
      gradientStart: "#FBF9F4",
      gradientEnd: "#EFE9DC",
      gradientAngle: 155,
      textColor: "#1B1917",
      borderColor: "#D6CEC0",
      accentColor: "#C83E2B",
      shadowDepth: 18,
      shadowBlur: 28,
      glassBlur: 0,
      grainOpacity: 0.09,
      tiersEnabled: true,
      colorTiers: [
        {
          id: "tier-mid",
          label: "Under 50% Left",
          maxRemainingPct: 50,
          backgroundColor: "#FAF6EE",
          textColor: "#1C1917",
          accentColor: "#B45309",
          borderColor: "#E2C9A2",
        },
        {
          id: "tier-final",
          label: "Final 15% Sprint",
          maxRemainingPct: 15,
          backgroundColor: "#FFF3F0",
          textColor: "#261210",
          accentColor: "#DC2626",
          borderColor: "#F5B8AE",
        },
      ],
    },
    layout: {
      aspectRatio: "portrait",
      padding: 24,
      cornerRadius: 14,
      borderStyle: "solid",
      borderWidth: 1,
      tearEdgeStyle: "perforated",
      tearDirection: "peel",
      animationSpeedMs: 460,
      stackDepth: 4,
      elementOrder: [
        "eventName",
        "dayOfWeek",
        "daysRemaining",
        "date",
        "progress",
        "sequence",
      ],
      visibleElements: {
        eventName: true,
        daysRemaining: true,
        progress: true,
        date: true,
        dayOfWeek: true,
        sequence: true,
      },
    },
  };
}

export function createDefaultRules(): CountdownRules {
  return {
    unit: "days",
    plainNumber: true,
    prefix: "",
    suffix: " left",
    progressMode: "both",
    monthlyMilestoneEnabled: true,
    monthlyMilestoneDay: 1,
    monthlyMilestoneLabel: "Monthly Milestone",
    finalWindowEnabled: true,
    finalWindowDays: 30,
    finalWindowLabel: "Final Stretch",
  };
}

export function createBuiltInPresets(): StylePreset[] {
  const kyoto = createDefaultStyle();

  const swiss = createDefaultStyle();
  swiss.surface = {
    ...swiss.surface,
    backgroundType: "solid",
    backgroundColor: "#FFFFFF",
    textColor: "#0F1115",
    borderColor: "#0F1115",
    accentColor: "#E11D48",
    grainOpacity: 0.03,
    shadowDepth: 10,
    shadowBlur: 18,
  };
  swiss.layout.cornerRadius = 4;
  swiss.layout.borderWidth = 2;
  swiss.layout.tearEdgeStyle = "jagged";
  swiss.typography.daysRemaining.fontFamily = '"Space Grotesk", sans-serif';
  swiss.typography.daysRemaining.fontWeight = 700;
  swiss.typography.daysRemaining.fontSize = 86;

  const midnight = createDefaultStyle();
  midnight.surface = {
    ...midnight.surface,
    backgroundType: "gradient",
    gradientStart: "#181B24",
    gradientEnd: "#0D0F14",
    gradientAngle: 145,
    backgroundColor: "#141720",
    textColor: "#F5F3EE",
    borderColor: "#2E3446",
    accentColor: "#F59E0B",
    glassBlur: 10,
    grainOpacity: 0.14,
    shadowDepth: 24,
    shadowBlur: 36,
    tiersEnabled: false,
  };
  midnight.typography.daysRemaining.fontFamily = '"Fraunces", Georgia, serif';
  midnight.typography.daysRemaining.fontWeight = 600;
  midnight.layout.cornerRadius = 22;

  const studioSage = createDefaultStyle();
  studioSage.surface = {
    ...studioSage.surface,
    backgroundType: "gradient",
    gradientStart: "#EDF4EE",
    gradientEnd: "#DCE8DF",
    gradientAngle: 165,
    backgroundColor: "#E8F0EA",
    textColor: "#14261C",
    borderColor: "#B7CEBE",
    accentColor: "#15803D",
    grainOpacity: 0.08,
  };
  studioSage.typography.daysRemaining.fontFamily = '"Playfair Display", Georgia, serif';
  studioSage.layout.tearEdgeStyle = "perforated";

  return [
    { id: "preset-kyoto", name: "Kyoto Paper", scope: "global", style: kyoto },
    { id: "preset-swiss", name: "Swiss Poster", scope: "global", style: swiss },
    { id: "preset-midnight", name: "Midnight Glass", scope: "global", style: midnight },
    { id: "preset-sage", name: "Botanical Ink", scope: "global", style: studioSage },
  ];
}

export function createInitialAppState(): AppState {
  const baseStyle = createDefaultStyle();
  const presets = createBuiltInPresets();
  const midnightStyle = presets[2]?.style ?? createDefaultStyle();

  const events: CountdownEvent[] = [
    {
      id: "evt-tokyo-2029",
      title: "Kyoto Sabbatical",
      startDate: "2026-01-01",
      targetDate: "2029-11-02",
      currentSlipDate: "2026-11-25",
      archived: false,
      rules: createDefaultRules(),
      useCustomStyle: false,
      style: structuredClone(baseStyle),
    },
    {
      id: "evt-product-launch",
      title: "Studio Launch",
      startDate: "2026-09-01",
      targetDate: "2026-12-18",
      currentSlipDate: "2026-11-25",
      archived: false,
      rules: {
        ...createDefaultRules(),
        finalWindowDays: 30,
        plainNumber: false,
        prefix: "",
        suffix: " DAYS",
      },
      useCustomStyle: true,
      style: structuredClone(midnightStyle),
    },
    {
      id: "evt-marathon",
      title: "Autumn Marathon",
      startDate: "2026-06-01",
      targetDate: "2026-10-18",
      currentSlipDate: "2026-10-18",
      archived: true,
      rules: createDefaultRules(),
      useCustomStyle: false,
      style: structuredClone(baseStyle),
    },
  ];

  return {
    events,
    activeEventId: "evt-tokyo-2029",
    globalStyle: baseStyle,
    presets,
    tearHistory: [],
  };
}