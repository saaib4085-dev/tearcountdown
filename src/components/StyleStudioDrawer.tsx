import { useState } from "react";
import { Copy, Download, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { exportStyleJson, parseImportedStyleJson } from "@/lib/countdown-store";
import type { CountdownEvent, SlipStyleConfig, StylePreset } from "@/lib/countdown-types";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { LayoutTab } from "./studio/LayoutTab";
import { SurfaceTab } from "./studio/SurfaceTab";
import { TypographyTab } from "./studio/TypographyTab";

interface StyleStudioDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CountdownEvent;
  activeStyle: SlipStyleConfig;
  presets: StylePreset[];
  onChangeStyle: (next: SlipStyleConfig) => void;
  onToggleEventOverride: (useCustom: boolean) => void;
  onSavePreset: (name: string, scope: "global" | "event") => void;
  onApplyPreset: (preset: StylePreset) => void;
  onDeletePreset: (id: string) => void;
}

export function StyleStudioDrawer({
  open,
  onOpenChange,
  event,
  activeStyle,
  presets,
  onChangeStyle,
  onToggleEventOverride,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
}: StyleStudioDrawerProps) {
  const [presetName, setPresetName] = useState("");
  const [importText, setImportText] = useState("");

  const handleSavePreset = (scope: "global" | "event") => {
    const clean = presetName.trim();
    if (!clean) {
      toast.error("Name your preset first.");
      return;
    }
    onSavePreset(clean, scope);
    setPresetName("");
    toast.success(`Saved "${clean}" (${scope})`);
  };

  const handleCopyStyleJson = async () => {
    try {
      await navigator.clipboard.writeText(exportStyleJson(activeStyle, event.title));
      toast.success("Style JSON copied");
    } catch {
      toast.error("Could not copy JSON");
    }
  };

  const handleDownloadStyleJson = () => {
    const json = exportStyleJson(activeStyle, event.title);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `slipday-style-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Style JSON downloaded");
  };

  const handleImportStyleJson = () => {
    if (!importText.trim()) {
      toast.error("Paste a style JSON payload first.");
      return;
    }
    try {
      const { style, name } = parseImportedStyleJson(importText);
      onChangeStyle(style);
      setImportText("");
      toast.success(`Imported "${name}"`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid style JSON");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md">
        <DrawerHeader className="pb-2 text-left">
          <div className="flex items-center justify-between gap-2">
            <div>
              <DrawerTitle>Live Style Studio</DrawerTitle>
              <DrawerDescription>
                Editing {event.useCustomStyle ? `${event.title} only` : "Global default style"}
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5">
              <Label className="text-[11px]">Per-Event</Label>
              <Switch
                checked={event.useCustomStyle}
                onCheckedChange={onToggleEventOverride}
                aria-label="Use custom style for this event"
              />
            </div>
          </div>
        </DrawerHeader>

        <Tabs defaultValue="typography" className="w-full px-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="typography" className="text-xs">
              Type
            </TabsTrigger>
            <TabsTrigger value="surface" className="text-xs">
              Surface
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">
              Layout
            </TabsTrigger>
            <TabsTrigger value="presets" className="text-xs">
              Presets
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="mt-3 h-[54vh] pr-2 pb-6">
            <TabsContent value="typography" className="mt-0">
              <TypographyTab styleConfig={activeStyle} onChange={onChangeStyle} />
            </TabsContent>

            <TabsContent value="surface" className="mt-0">
              <SurfaceTab styleConfig={activeStyle} onChange={onChangeStyle} />
            </TabsContent>

            <TabsContent value="layout" className="mt-0">
              <LayoutTab styleConfig={activeStyle} onChange={onChangeStyle} />
            </TabsContent>

            <TabsContent value="presets" className="mt-0 space-y-4">
              <div className="space-y-2 rounded-lg border border-border p-3">
                <Label className="text-xs font-semibold">Save Current Style as Preset</Label>
                <Input
                  placeholder="Preset name (e.g., Warm Editorial)"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="h-8 text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 gap-1 text-xs"
                    onClick={() => handleSavePreset("event")}
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save for Event
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 flex-1 gap-1 text-xs"
                    onClick={() => handleSavePreset("global")}
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Global
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Saved & Built-in Presets</Label>
                <div className="grid grid-cols-1 gap-2">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onApplyPreset(preset);
                          toast.success(`Applied "${preset.name}"`);
                        }}
                        className="flex flex-1 items-center gap-2.5 text-left"
                      >
                        <span
                          className="h-6 w-6 rounded-md border"
                          style={{
                            background:
                              preset.style.surface.backgroundType === "gradient"
                                ? `linear-gradient(${preset.style.surface.gradientAngle}deg, ${preset.style.surface.gradientStart}, ${preset.style.surface.gradientEnd})`
                                : preset.style.surface.backgroundColor,
                            borderColor: preset.style.surface.accentColor,
                          }}
                        />
                        <div>
                          <div className="text-xs font-medium text-foreground">{preset.name}</div>
                          <div className="text-[10px] uppercase text-muted-foreground">
                            {preset.scope}
                          </div>
                        </div>
                      </button>
                      {!preset.id.startsWith("preset-") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => onDeletePreset(preset.id)}
                          aria-label={`Delete ${preset.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border p-3">
                <Label className="text-xs font-semibold">JSON Export / Import</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 gap-1 text-xs"
                    onClick={handleCopyStyleJson}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 gap-1 text-xs"
                    onClick={handleDownloadStyleJson}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
                <Textarea
                  placeholder="Paste exported style JSON here to import..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="min-h-[84px] font-mono text-[11px]"
                />
                <Button
                  size="sm"
                  className="h-8 w-full gap-1.5 text-xs"
                  onClick={handleImportStyleJson}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Import Style JSON
                </Button>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}