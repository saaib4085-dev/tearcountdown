import type { CSSProperties } from "react";
import type {
  ComputedSlipState,
  CountdownEvent,
  ElementTypography,
  FrontFaceElementKey,
  SlipStyleConfig,
} from "@/lib/countdown-types";

interface SlipFaceProps {
  event: CountdownEvent;
  styleConfig: SlipStyleConfig;
  computed: ComputedSlipState;
  compactScale?: number;
  showTearEdge?: boolean;
  className?: string;
}

function typoToCss(t: ElementTypography, scale = 1): CSSProperties {
  return {
    fontFamily: t.fontFamily,
    fontSize: `${Math.max(9, Math.round(t.fontSize * scale))}px`,
    fontWeight: t.fontWeight,
    letterSpacing: `${t.letterSpacing}em`,
    lineHeight: t.lineHeight,
    textTransform: t.uppercase ? "uppercase" : "none",
    fontStyle: t.italic ? "italic" : "normal",
  };
}

export function getAspectRatioClass(ratio: SlipStyleConfig["layout"]["aspectRatio"]): string {
  switch (ratio) {
    case "square":
      return "aspect-square";
    case "classic":
      return "aspect-[4/5]";
    case "tall":
      return "aspect-[2/3]";
    case "portrait":
    default:
      return "aspect-[3/4]";
  }
}

function TearEdge({
  edgeStyle,
  borderColor,
  accentColor,
}: {
  edgeStyle: SlipStyleConfig["layout"]["tearEdgeStyle"];
  borderColor: string;
  accentColor: string;
}) {
  if (edgeStyle === "straight") {
    return <div className="h-[2px] w-full" style={{ backgroundColor: borderColor }} />;
  }

  if (edgeStyle === "jagged") {
    return (
      <svg
        viewBox="0 0 300 10"
        preserveAspectRatio="none"
        className="block h-2.5 w-full"
        aria-hidden="true"
      >
        <polyline
          fill="none"
          stroke={borderColor}
          strokeWidth="1.5"
          points="0,9 10,1 20,9 30,1 40,9 50,1 60,9 70,1 80,9 90,1 100,9 110,1 120,9 130,1 140,9 150,1 160,9 170,1 180,9 190,1 200,9 210,1 220,9 230,1 240,9 250,1 260,9 270,1 280,9 290,1 300,9"
        />
      </svg>
    );
  }

  // perforated
  return (
    <div className="flex w-full items-center justify-between gap-1 px-2 py-1" aria-hidden="true">
      {Array.from({ length: 19 }).map((_, idx) => (
        <span
          key={idx}
          className="h-[3px] flex-1 rounded-full"
          style={{ backgroundColor: idx % 6 === 0 ? accentColor : borderColor, opacity: 0.65 }}
        />
      ))}
    </div>
  );
}

const NOISE_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function SlipFace({
  event,
  styleConfig,
  computed,
  compactScale = 1,
  showTearEdge = true,
  className = "",
}: SlipFaceProps) {
  const { surface, layout, typography } = styleConfig;
  const tier = computed.activeTier;

  const bgColor = tier ? tier.backgroundColor : surface.backgroundColor;
  const textColor = tier ? tier.textColor : surface.textColor;
  const accentColor = tier ? tier.accentColor : surface.accentColor;
  const borderColor = tier ? tier.borderColor : surface.borderColor;

  const backgroundStyle: string =
    surface.backgroundType === "gradient" && !tier
      ? `linear-gradient(${surface.gradientAngle}deg, ${surface.gradientStart}, ${surface.gradientEnd})`
      : bgColor;

  const cardStyle: CSSProperties = {
    background: backgroundStyle,
    color: textColor,
    borderRadius: `${layout.cornerRadius}px`,
    borderStyle: layout.borderStyle,
    borderWidth: layout.borderStyle === "none" ? 0 : `${layout.borderWidth}px`,
    borderColor,
    boxShadow: `0 ${surface.shadowDepth}px ${surface.shadowBlur}px -6px rgba(15, 14, 12, 0.24)`,
    backdropFilter: surface.glassBlur > 0 ? `blur(${surface.glassBlur}px)` : undefined,
    WebkitBackdropFilter: surface.glassBlur > 0 ? `blur(${surface.glassBlur}px)` : undefined,
  };

  const countdownLen = computed.formattedCountdown.length;
  const autoFitFactor =
    countdownLen >= 10 ? 0.44 : countdownLen >= 7 ? 0.58 : countdownLen >= 5 ? 0.74 : 1;

  const renderElement = (key: FrontFaceElementKey) => {
    if (!layout.visibleElements[key]) return null;

    switch (key) {
      case "eventName":
        return (
          <div
            key={key}
            className="truncate text-center"
            style={{ ...typoToCss(typography.eventName, compactScale), color: textColor }}
          >
            {event.title}
          </div>
        );

      case "dayOfWeek":
        return (
          <div
            key={key}
            className="text-center opacity-75"
            style={{ ...typoToCss(typography.dayOfWeek, compactScale), color: accentColor }}
          >
            {computed.dayOfWeek}
          </div>
        );

      case "daysRemaining":
        return (
          <div key={key} className="my-auto flex flex-col items-center justify-center py-1">
            <div
              className="tabular-nums text-center break-all"
              style={{
                ...typoToCss(typography.daysRemaining, compactScale * autoFitFactor),
                color: computed.isFinalWindow ? accentColor : textColor,
              }}
            >
              {computed.formattedCountdown}
            </div>
            {!event.rules.plainNumber ? null : (
              <span
                className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] opacity-50"
                style={{ color: textColor }}
              >
                {event.rules.unit}
              </span>
            )}
          </div>
        );

      case "date":
        return (
          <div
            key={key}
            className="text-center"
            style={{ ...typoToCss(typography.date, compactScale), color: textColor }}
          >
            {computed.formattedDate}
          </div>
        );

      case "progress": {
        if (event.rules.progressMode === "none") return null;
        return (
          <div key={key} className="w-full space-y-1.5">
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: `${textColor}1A` }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${
                    event.rules.progressMode === "remaining"
                      ? computed.remainingPct
                      : computed.elapsedPct
                  }%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
            <div
              className="flex flex-wrap items-center justify-between gap-2"
              style={{ ...typoToCss(typography.progress, compactScale), color: textColor }}
            >
              {(event.rules.progressMode === "elapsed" || event.rules.progressMode === "both") && (
                <span>{computed.elapsedPct.toFixed(1)}% elapsed</span>
              )}
              {(event.rules.progressMode === "remaining" ||
                event.rules.progressMode === "both") && (
                <span>{computed.remainingPct.toFixed(1)}% left</span>
              )}
            </div>
          </div>
        );
      }

      case "sequence":
        return (
          <div
            key={key}
            className="flex items-center justify-between border-t pt-2 opacity-75"
            style={{
              ...typoToCss(typography.sequence, compactScale),
              borderColor: `${textColor}22`,
              color: textColor,
            }}
          >
            <span>
              #{computed.sequenceNumber} / {computed.totalDays}
            </span>
            <span>TARGET {event.targetDate}</span>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative flex w-full flex-col overflow-hidden select-none ${getAspectRatioClass(
        layout.aspectRatio,
      )} ${className}`}
      style={cardStyle}
    >
      {/* Paper Grain Overlay */}
      {surface.grainOpacity > 0 && (
        <div
          className="pointer-events-none absolute inset-0 mix-blend-multiply"
          style={{
            backgroundImage: NOISE_DATA_URI,
            opacity: surface.grainOpacity,
          }}
          aria-hidden="true"
        />
      )}

      {/* Top Tear Edge */}
      {showTearEdge && (
        <TearEdge
          edgeStyle={layout.tearEdgeStyle}
          borderColor={borderColor}
          accentColor={accentColor}
        />
      )}

      {/* Slip Body */}
      <div
        className="relative z-10 flex flex-1 flex-col justify-between gap-2"
        style={{ padding: `${Math.max(10, Math.round(layout.padding * compactScale))}px` }}
      >
        {/* Special Mode Indicators */}
        {(computed.isMonthlyMilestone || computed.isFinalWindow || computed.isCompleted) && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {computed.isMonthlyMilestone && (
              <span
                className="rounded-full border px-2.5 py-0.5"
                style={{
                  ...typoToCss(typography.monthlyMilestone, compactScale),
                  borderColor: accentColor,
                  color: accentColor,
                  backgroundColor: `${accentColor}14`,
                }}
              >
                {event.rules.monthlyMilestoneLabel}
              </span>
            )}
            {computed.isFinalWindow && (
              <span
                className="rounded-full px-2.5 py-0.5"
                style={{
                  ...typoToCss(typography.finalWindow, compactScale),
                  backgroundColor: accentColor,
                  color: bgColor,
                }}
              >
                {event.rules.finalWindowLabel}
              </span>
            )}
            {computed.isCompleted && (
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest"
                style={{ backgroundColor: accentColor, color: bgColor }}
              >
                Day Zero
              </span>
            )}
          </div>
        )}

        {layout.elementOrder.map((key) => renderElement(key))}
      </div>
    </div>
  );
}