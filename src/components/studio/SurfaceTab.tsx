import { Plus, Trash2 } from "lucide-react";
import { generateId } from "@/lib/countdown-store";
import type { ColorTier, SlipStyleConfig, SurfaceStyle } from "@/lib/countdown-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface SurfaceTabProps {
  styleConfig: SlipStyleConfig;
  onChange: (next: SlipStyleConfig) => void;
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5">
      <span className="text-xs text-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10px] text-muted-foreground">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </div>
    </label>
  );
}

export function SurfaceTab({ styleConfig, onChange }: SurfaceTabProps) {
  const { surface } = styleConfig;

  const updateSurface = <K extends keyof SurfaceStyle>(key: K, value: SurfaceStyle[K]) => {
    onChange({
      ...styleConfig,
      surface: { ...surface, [key]: value },
    });
  };

  const updateTier = (id: string, patch: Partial<ColorTier>) => {
    updateSurface(
      "colorTiers",
      surface.colorTiers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  };

  const addTier = () => {
    const nextTier: ColorTier = {
      id: generateId("tier"),
      label: "Custom Tier",
      maxRemainingPct: 25,
      backgroundColor: "#FEF3C7",
      textColor: "#291D0A",
      accentColor: "#D97706",
      borderColor: "#F5D08A",
    };
    updateSurface("colorTiers", [...surface.colorTiers, nextTier]);
  };

  return (
    <div className="space-y-4">
      {/* Background Mode */}
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label className="text-xs">Gradient Background</Label>
        <Switch
          checked={surface.backgroundType === "gradient"}
          onCheckedChange={(v) => updateSurface("backgroundType", v ? "gradient" : "solid")}
        />
      </div>

      {surface.backgroundType === "solid" ? (
        <ColorField
          label="Background"
          value={surface.backgroundColor}
          onChange={(v) => updateSurface("backgroundColor", v)}
        />
      ) : (
        <div className="space-y-2.5 rounded-lg border border-border p-2.5">
          <div className="grid grid-cols-2 gap-2">
            <ColorField
              label="Start"
              value={surface.gradientStart}
              onChange={(v) => updateSurface("gradientStart", v)}
            />
            <ColorField
              label="End"
              value={surface.gradientEnd}
              onChange={(v) => updateSurface("gradientEnd", v)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <Label className="text-xs">Gradient Angle</Label>
              <span className="font-mono text-muted-foreground">{surface.gradientAngle}°</span>
            </div>
            <Slider
              min={0}
              max={360}
              step={5}
              value={[surface.gradientAngle]}
              onValueChange={(v) => updateSurface("gradientAngle", v[0] ?? surface.gradientAngle)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        <ColorField
          label="Text Color"
          value={surface.textColor}
          onChange={(v) => updateSurface("textColor", v)}
        />
        <ColorField
          label="Accent Color"
          value={surface.accentColor}
          onChange={(v) => updateSurface("accentColor", v)}
        />
        <ColorField
          label="Border Color"
          value={surface.borderColor}
          onChange={(v) => updateSurface("borderColor", v)}
        />
      </div>

      {/* Surface FX Sliders */}
      <div className="space-y-3 rounded-lg border border-border p-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <Label className="text-xs">Shadow Depth</Label>
            <span className="font-mono text-muted-foreground">{surface.shadowDepth}px</span>
          </div>
          <Slider
            min={0}
            max={40}
            step={1}
            value={[surface.shadowDepth]}
            onValueChange={(v) => updateSurface("shadowDepth", v[0] ?? surface.shadowDepth)}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <Label className="text-xs">Shadow Blur</Label>
            <span className="font-mono text-muted-foreground">{surface.shadowBlur}px</span>
          </div>
          <Slider
            min={0}
            max={60}
            step={1}
            value={[surface.shadowBlur]}
            onValueChange={(v) => updateSurface("shadowBlur", v[0] ?? surface.shadowBlur)}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <Label className="text-xs">Glass / Backdrop Blur</Label>
            <span className="font-mono text-muted-foreground">{surface.glassBlur}px</span>
          </div>
          <Slider
            min={0}
            max={24}
            step={1}
            value={[surface.glassBlur]}
            onValueChange={(v) => updateSurface("glassBlur", v[0] ?? surface.glassBlur)}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <Label className="text-xs">Paper Grain / Noise</Label>
            <span className="font-mono text-muted-foreground">
              {Math.round(surface.grainOpacity * 100)}%
            </span>
          </div>
          <Slider
            min={0}
            max={0.35}
            step={0.01}
            value={[surface.grainOpacity]}
            onValueChange={(v) =>
              updateSurface("grainOpacity", Number((v[0] ?? surface.grainOpacity).toFixed(2)))
            }
          />
        </div>
      </div>

      {/* Dynamic Color Tiers */}
      <div className="space-y-2.5 rounded-lg border border-border p-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs font-semibold">Time-Remaining Color Tiers</Label>
            <p className="text-[11px] text-muted-foreground">
              Auto-shift slip colors as remaining % drops
            </p>
          </div>
          <Switch
            checked={surface.tiersEnabled}
            onCheckedChange={(v) => updateSurface("tiersEnabled", v)}
          />
        </div>

        {surface.tiersEnabled && (
          <div className="space-y-2.5 pt-1">
            {surface.colorTiers.map((tier) => (
              <div key={tier.id} className="space-y-2 rounded-lg bg-secondary/50 p-2.5">
                <div className="flex items-center gap-2">
                  <Input
                    value={tier.label}
                    onChange={(e) => updateTier(tier.id, { label: e.target.value })}
                    className="h-7 flex-1 text-xs"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">≤</span>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={tier.maxRemainingPct}
                      onChange={(e) =>
                        updateTier(tier.id, {
                          maxRemainingPct: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                        })
                      }
                      className="h-7 w-14 text-xs"
                    />
                    <span className="text-[10px] text-muted-foreground">%</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() =>
                      updateSurface(
                        "colorTiers",
                        surface.colorTiers.filter((t) => t.id !== tier.id),
                      )
                    }
                    aria-label="Delete tier"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      ["BG", "backgroundColor"],
                      ["Text", "textColor"],
                      ["Accent", "accentColor"],
                      ["Border", "borderColor"],
                    ] as const
                  ).map(([lbl, field]) => (
                    <label
                      key={field}
                      className="flex flex-col items-center gap-1 rounded border border-border bg-card py-1 text-[10px]"
                    >
                      <span>{lbl}</span>
                      <input
                        type="color"
                        value={tier[field]}
                        onChange={(e) => updateTier(tier.id, { [field]: e.target.value })}
                        className="h-5 w-8 cursor-pointer border-0 bg-transparent p-0"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="h-8 w-full gap-1.5 text-xs" onClick={addTier}>
              <Plus className="h-3.5 w-3.5" />
              Add Color Tier
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}