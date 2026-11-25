import { useState } from "react";
import { FONT_OPTIONS, TYPOGRAPHY_ELEMENT_LABELS } from "@/lib/countdown-defaults";
import type {
  ElementTypography,
  SlipStyleConfig,
  TypographyElementKey,
} from "@/lib/countdown-types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface TypographyTabProps {
  styleConfig: SlipStyleConfig;
  onChange: (next: SlipStyleConfig) => void;
}

const ELEMENT_KEYS = Object.keys(TYPOGRAPHY_ELEMENT_LABELS) as TypographyElementKey[];

export function TypographyTab({ styleConfig, onChange }: TypographyTabProps) {
  const [selectedKey, setSelectedKey] = useState<TypographyElementKey>("daysRemaining");
  const current = styleConfig.typography[selectedKey];

  const updateField = <K extends keyof ElementTypography>(
    field: K,
    value: ElementTypography[K],
  ) => {
    onChange({
      ...styleConfig,
      typography: {
        ...styleConfig.typography,
        [selectedKey]: {
          ...current,
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Target Element</Label>
        <Select
          value={selectedKey}
          onValueChange={(v) => setSelectedKey(v as TypographyElementKey)}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ELEMENT_KEYS.map((key) => (
              <SelectItem key={key} value={key} className="text-xs">
                {TYPOGRAPHY_ELEMENT_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Font Family</Label>
        <Select value={current.fontFamily} onValueChange={(v) => updateField("fontFamily", v)}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((font) => (
              <SelectItem
                key={font.value}
                value={font.value}
                style={{ fontFamily: font.value }}
                className="text-xs"
              >
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <Label className="text-xs">Font Size</Label>
          <span className="font-mono text-muted-foreground">{current.fontSize}px</span>
        </div>
        <Slider
          min={9}
          max={140}
          step={1}
          value={[current.fontSize]}
          onValueChange={(vals) => updateField("fontSize", vals[0] ?? current.fontSize)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <Label className="text-xs">Font Weight</Label>
          <span className="font-mono text-muted-foreground">{current.fontWeight}</span>
        </div>
        <Slider
          min={300}
          max={800}
          step={100}
          value={[current.fontWeight]}
          onValueChange={(vals) => updateField("fontWeight", vals[0] ?? current.fontWeight)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <Label className="text-xs">Letter Spacing</Label>
          <span className="font-mono text-muted-foreground">
            {current.letterSpacing.toFixed(2)}em
          </span>
        </div>
        <Slider
          min={-0.08}
          max={0.3}
          step={0.01}
          value={[current.letterSpacing]}
          onValueChange={(vals) =>
            updateField("letterSpacing", Number((vals[0] ?? current.letterSpacing).toFixed(2)))
          }
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <Label className="text-xs">Line Height</Label>
          <span className="font-mono text-muted-foreground">{current.lineHeight.toFixed(2)}</span>
        </div>
        <Slider
          min={0.8}
          max={2.0}
          step={0.05}
          value={[current.lineHeight]}
          onValueChange={(vals) =>
            updateField("lineHeight", Number((vals[0] ?? current.lineHeight).toFixed(2)))
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <Label className="text-xs">Uppercase</Label>
          <Switch
            checked={current.uppercase}
            onCheckedChange={(v) => updateField("uppercase", v)}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <Label className="text-xs">Italic</Label>
          <Switch checked={current.italic} onCheckedChange={(v) => updateField("italic", v)} />
        </div>
      </div>
    </div>
  );
}