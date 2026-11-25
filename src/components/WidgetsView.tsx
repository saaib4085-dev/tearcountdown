import type { CSSProperties } from "react";
import { useState } from "react";
import { Check, Code2, Copy, Download, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { buildNativeWidgetPayload } from "@/lib/countdown-store";
import type { ComputedSlipState, CountdownEvent, SlipStyleConfig } from "@/lib/countdown-types";
import { Button } from "@/components/ui/button";
import { SlipFace } from "./SlipFace";

interface WidgetsViewProps {
  event: CountdownEvent;
  styleConfig: SlipStyleConfig;
  computed: ComputedSlipState;
  onOpenStudio: () => void;
}

export function WidgetsView({
  event,
  styleConfig,
  computed,
  onOpenStudio,
}: WidgetsViewProps) {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const { surface, typography, layout } = styleConfig;
  const tier = computed.activeTier;
  const bgColor = tier ? tier.backgroundColor : surface.backgroundColor;
  const textColor = tier ? tier.textColor : surface.textColor;
  const accentColor = tier ? tier.accentColor : surface.accentColor;
  const borderColor = tier ? tier.borderColor : surface.borderColor;

  const backgroundStyle =
    surface.backgroundType === "gradient" && !tier
      ? `linear-gradient(${surface.gradientAngle}deg, ${surface.gradientStart}, ${surface.gradientEnd})`
      : bgColor;

  const baseWidgetStyle: CSSProperties = {
    background: backgroundStyle,
    color: textColor,
    borderColor,
    borderStyle: layout.borderStyle,
    borderWidth: layout.borderStyle === "none" ? 0 : `${layout.borderWidth}px`,
    borderRadius: `${Math.max(14, layout.cornerRadius)}px`,
    boxShadow: `0 ${Math.round(surface.shadowDepth * 0.6)}px ${Math.round(
      surface.shadowBlur * 0.7,
    )}px -6px rgba(15, 14, 12, 0.22)`,
  };

  const payload = buildNativeWidgetPayload(event, styleConfig, computed);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      toast.success("Native widget JSON copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "slipday"}-widget.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Widget config downloaded");
  };

  const valueLen = computed.formattedCountdown.length;
  const smallSize = valueLen >= 8 ? 22 : valueLen >= 5 ? 32 : 44;
  const medSize = valueLen >= 8 ? 28 : valueLen >= 5 ? 40 : 56;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pb-8 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Home-Screen Widgets</h2>
          <p className="text-xs text-muted-foreground">
            Live Small, Medium & Large previews mirroring your active style
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={onOpenStudio}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Style
        </Button>
      </div>

      {/* Phone Home Screen Mock Surface */}
      <div className="space-y-4 rounded-3xl border border-border bg-secondary/60 p-4">
        {/* Small (2x2) */}
        <div className="space-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Small · 2×2
          </span>
          <div
            className="flex h-[156px] w-[156px] flex-col justify-between overflow-hidden p-3.5"
            style={baseWidgetStyle}
          >
            <div className="flex items-center justify-between gap-1">
              <span
                className="truncate"
                style={{
                  fontFamily: typography.eventName.fontFamily,
                  fontSize: "10px",
                  fontWeight: typography.eventName.fontWeight,
                  textTransform: typography.eventName.uppercase ? "uppercase" : "none",
                  letterSpacing: `${typography.eventName.letterSpacing}em`,
                }}
              >
                {event.title}
              </span>
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            </div>

            <div
              className="tabular-nums leading-none"
              style={{
                fontFamily: typography.daysRemaining.fontFamily,
                fontSize: `${smallSize}px`,
                fontWeight: typography.daysRemaining.fontWeight,
                color: computed.isFinalWindow ? accentColor : textColor,
              }}
            >
              {computed.formattedCountdown}
            </div>

            <div className="space-y-1">
              <div
                className="h-1 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: `${textColor}1F` }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${computed.elapsedPct}%`, backgroundColor: accentColor }}
                />
              </div>
              <div
                className="flex justify-between font-mono text-[9px] opacity-75"
                style={{ fontFamily: typography.progress.fontFamily }}
              >
                <span>{event.rules.unit}</span>
                <span>{computed.elapsedPct.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Medium (4x2) */}
        <div className="space-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Medium · 4×2
          </span>
          <div
            className="flex h-[156px] w-full items-center justify-between gap-4 overflow-hidden px-5 py-4"
            style={baseWidgetStyle}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div
                className="truncate opacity-80"
                style={{
                  fontFamily: typography.eventName.fontFamily,
                  fontSize: "11px",
                  fontWeight: typography.eventName.fontWeight,
                  textTransform: typography.eventName.uppercase ? "uppercase" : "none",
                  letterSpacing: `${typography.eventName.letterSpacing}em`,
                }}
              >
                {event.title}
              </div>
              <div
                className="tabular-nums leading-none"
                style={{
                  fontFamily: typography.daysRemaining.fontFamily,
                  fontSize: `${medSize}px`,
                  fontWeight: typography.daysRemaining.fontWeight,
                  color: computed.isFinalWindow ? accentColor : textColor,
                }}
              >
                {computed.formattedCountdown}
              </div>
              <div className="pt-1 font-mono text-[10px] uppercase opacity-65">
                {event.rules.unit} · #{computed.sequenceNumber}/{computed.totalDays}
              </div>
            </div>

            <div className="flex w-[112px] shrink-0 flex-col items-end justify-between self-stretch border-l pl-3 text-right" style={{ borderColor: `${textColor}22` }}>
              <div>
                <div
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  {computed.dayOfWeek.slice(0, 3)}
                </div>
                <div
                  className="mt-0.5 text-sm"
                  style={{ fontFamily: typography.date.fontFamily }}
                >
                  {computed.formattedDate}
                </div>
              </div>
              <div className="w-full space-y-1">
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: `${textColor}1F` }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${computed.elapsedPct}%`, backgroundColor: accentColor }}
                  />
                </div>
                <div className="font-mono text-[9px] opacity-75">
                  {computed.elapsedPct.toFixed(1)}% / {computed.remainingPct.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Large (4x4) */}
        <div className="space-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Large · 4×4
          </span>
          <div className="mx-auto w-full max-w-[320px]">
            <SlipFace
              event={event}
              styleConfig={{
                ...styleConfig,
                layout: { ...styleConfig.layout, aspectRatio: "square" },
              }}
              computed={computed}
              compactScale={0.84}
            />
          </div>
        </div>
      </div>

      {/* Native Widget JSON Exporter */}
      <div className="space-y-2.5 rounded-xl border border-border bg-card p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Native Widget JSON Config</h3>
            <p className="text-xs text-muted-foreground">
              Mirror active styling and rules into an iOS / Android widget wrapper
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => setShowJson((v) => !v)}
          >
            <Code2 className="h-3.5 w-3.5" />
            {showJson ? "Hide" : "Inspect"}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={handleCopyJson}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy JSON"}
          </Button>
          <Button size="sm" className="flex-1 gap-1.5" onClick={handleDownloadJson}>
            <Download className="h-3.5 w-3.5" />
            Download JSON
          </Button>
        </div>

        {showJson && (
          <pre className="max-h-56 overflow-auto rounded-lg bg-secondary p-3 font-mono text-[11px] leading-relaxed text-secondary-foreground">
            {payload}
          </pre>
        )}
      </div>
    </div>
  );
}