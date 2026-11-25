import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { useState } from "react";
import { FRONT_FACE_LABELS } from "@/lib/countdown-defaults";
import type {
  BorderStyleOption,
  FrontFaceElementKey,
  LayoutMechanics,
  SlipAspectRatio,
  SlipStyleConfig,
  TearDirection,
  TearEdgeStyle,
} from "@/lib/countdown-types";
import { Button } from "@/components/ui/button";
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

interface LayoutTabProps {
  styleConfig: SlipStyleConfig;
  onChange: (next: SlipStyleConfig) => void;
}

export function LayoutTab({ styleConfig, onChange }: LayoutTabProps) {
  const { layout } = styleConfig;
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const updateLayout = <K extends keyof LayoutMechanics>(key: K, value: LayoutMechanics[K]) => {
    onChange({
      ...styleConfig,
      layout: { ...layout, [key]: value },
    });
  };

  const moveElement = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= layout.elementOrder.length || fromIdx === toIdx) return;
    const next = [...layout.elementOrder];
    const [moved] = next.splice(fromIdx, 1);
    if (!moved) return;
    next.splice(toIdx, 0, moved);
    updateLayout("elementOrder", next);
  };

  const toggleVisible = (key: FrontFaceElementKey, visible: boolean) => {
    updateLayout("visibleElements", { ...layout.visibleElements, [key]: visible });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Aspect Ratio</Label>
          <Select
            value={layout.aspectRatio}
            onValueChange={(v) => updateLayout("aspectRatio", v as SlipAspectRatio)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait (3:4)</SelectItem>
              <SelectItem value="classic">Classic (4:5)</SelectItem>
              <SelectItem value="tall">Tall (2:3)</SelectItem>
              <SelectItem value="square">Square (1:1)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Border Style</Label>
          <Select
            value={layout.borderStyle}
            onValueChange={(v) => updateLayout("borderStyle", v as BorderStyleOption)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="double">Double</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Tear-Off Edge</Label>
          <Select
            value={layout.tearEdgeStyle}
            onValueChange={(v) => updateLayout("tearEdgeStyle", v as TearEdgeStyle)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="perforated">Perforated</SelectItem>
              <SelectItem value="jagged">Jagged</SelectItem>
              <SelectItem value="straight">Straight</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Tear Direction</Label>
          <Select
            value={layout.tearDirection}
            onValueChange={(v) => updateLayout("tearDirection", v as TearDirection)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="peel">3D Corner Peel</SelectItem>
              <SelectItem value="down">Tear Down</SelectItem>
              <SelectItem value="up">Tear Up</SelectItem>
              <SelectItem value="left">Swipe Left</SelectItem>
              <SelectItem value="right">Swipe Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border p-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <Label className="text-xs">Inner Padding</Label>
            <span className="font-mono text-muted-foreground">{layout.padding}px</span>
          </div>
          <Slider
            min={12}
            max={40}
            step={1}
            value={[layout.padding]}
            onValueChange={(v) => updateLayout("padding", v[0] ?? layout.padding)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <Label className="text-xs">Corner Radius</Label>
            <span className="font-mono text-muted-foreground">{layout.cornerRadius}px</span>
          </div>
          <Slider
            min={0}
            max={32}
            step={1}
            value={[layout.cornerRadius]}
            onValueChange={(v) => updateLayout("cornerRadius", v[0] ?? layout.cornerRadius)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <Label className="text-xs">Animation Speed</Label>
            <span className="font-mono text-muted-foreground">{layout.animationSpeedMs}ms</span>
          </div>
          <Slider
            min={200}
            max={1000}
            step={20}
            value={[layout.animationSpeedMs]}
            onValueChange={(v) =>
              updateLayout("animationSpeedMs", v[0] ?? layout.animationSpeedMs)
            }
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <Label className="text-xs">Underneath Stack Depth</Label>
            <span className="font-mono text-muted-foreground">{layout.stackDepth} slips</span>
          </div>
          <Slider
            min={0}
            max={6}
            step={1}
            value={[layout.stackDepth]}
            onValueChange={(v) => updateLayout("stackDepth", v[0] ?? layout.stackDepth)}
          />
        </div>
      </div>

      {/* Element Visibility & Order */}
      <div className="space-y-2 rounded-lg border border-border p-3">
        <div>
          <Label className="text-xs font-semibold">Front Face Elements & Order</Label>
          <p className="text-[11px] text-muted-foreground">
            Drag or use arrows to arrange, toggle visibility per item
          </p>
        </div>
        <div className="space-y-1.5">
          {layout.elementOrder.map((key, idx) => (
            <div
              key={key}
              draggable
              onDragStart={() => setDragIndex(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) moveElement(dragIndex, idx);
                setDragIndex(null);
              }}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-2.5 py-1.5"
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-3.5 w-3.5 cursor-grab text-muted-foreground" />
                <span className="text-xs font-medium">{FRONT_FACE_LABELS[key]}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={idx === 0}
                  onClick={() => moveElement(idx, idx - 1)}
                  aria-label={`Move ${FRONT_FACE_LABELS[key]} up`}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={idx === layout.elementOrder.length - 1}
                  onClick={() => moveElement(idx, idx + 1)}
                  aria-label={`Move ${FRONT_FACE_LABELS[key]} down`}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Switch
                  checked={layout.visibleElements[key]}
                  onCheckedChange={(v) => toggleVisible(key, v)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}