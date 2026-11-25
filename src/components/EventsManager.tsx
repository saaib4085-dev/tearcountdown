import { useState } from "react";
import { Archive, ArchiveRestore, Check, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createDefaultRules, createDefaultStyle } from "@/lib/countdown-defaults";
import { computeSlipState, getEffectiveStyle, getTodayIso } from "@/lib/countdown-engine";
import { generateId } from "@/lib/countdown-store";
import type {
  CountdownEvent,
  CountdownRules,
  CountdownUnit,
  ProgressMode,
  SlipStyleConfig,
} from "@/lib/countdown-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventsManagerProps {
  events: CountdownEvent[];
  activeEventId: string;
  globalStyle: SlipStyleConfig;
  nowMs: number;
  onSelectEvent: (id: string) => void;
  onUpsertEvent: (event: CountdownEvent, activate?: boolean) => void;
  onDuplicateEvent: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDeleteEvent: (id: string) => void;
}

const UNIT_OPTIONS: { value: CountdownUnit; label: string }[] = [
  { value: "days", label: "Days" },
  { value: "seconds", label: "Seconds (Live)" },
  { value: "minutes", label: "Minutes (Live)" },
  { value: "hours", label: "Hours (Live)" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
];

export function EventsManager({
  events,
  activeEventId,
  globalStyle,
  nowMs,
  onSelectEvent,
  onUpsertEvent,
  onDuplicateEvent,
  onToggleArchive,
  onDeleteEvent,
}: EventsManagerProps) {
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [editing, setEditing] = useState<CountdownEvent | null>(null);
  const [isNew, setIsNew] = useState(false);

  const filtered = events.filter((e) => (tab === "archived" ? e.archived : !e.archived));

  const openCreate = () => {
    const today = getTodayIso();
    const targetYear = Number(today.slice(0, 4)) + 1;
    setIsNew(true);
    setEditing({
      id: generateId("evt"),
      title: "",
      startDate: today,
      targetDate: `${targetYear}${today.slice(4)}`,
      currentSlipDate: today,
      archived: false,
      rules: createDefaultRules(),
      useCustomStyle: false,
      style: structuredClone(globalStyle ?? createDefaultStyle()),
    });
  };

  const openEdit = (evt: CountdownEvent) => {
    setIsNew(false);
    setEditing(structuredClone(evt));
  };

  const updateRules = <K extends keyof CountdownRules>(key: K, value: CountdownRules[K]) => {
    setEditing((prev) => (prev ? { ...prev, rules: { ...prev.rules, [key]: value } } : null));
  };

  const handleSave = () => {
    if (!editing) return;
    const title = editing.title.trim();
    if (!title) {
      toast.error("Enter an event title.");
      return;
    }
    if (!editing.startDate || !editing.targetDate) {
      toast.error("Select both a start date and target date.");
      return;
    }
    if (editing.targetDate < editing.startDate) {
      toast.error("Target date must be on or after the start date.");
      return;
    }
    const milestoneDay = Math.max(1, Math.min(31, Math.round(editing.rules.monthlyMilestoneDay)));
    const finalDays = Math.max(1, Math.min(3650, Math.round(editing.rules.finalWindowDays)));

    onUpsertEvent(
      {
        ...editing,
        title,
        rules: {
          ...editing.rules,
          monthlyMilestoneDay: milestoneDay,
          finalWindowDays: finalDays,
        },
      },
      isNew,
    );
    toast.success(isNew ? "Countdown created" : "Countdown updated");
    setEditing(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3 px-4 pb-6 pt-2">
      <div className="flex items-center justify-between gap-2">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "archived")}>
          <TabsList className="h-9">
            <TabsTrigger value="active" className="text-xs">
              Active ({events.filter((e) => !e.archived).length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="text-xs">
              Archived ({events.filter((e) => e.archived).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" className="h-9 gap-1.5" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/60 px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {tab === "archived"
              ? "No archived countdowns yet."
              : "No active countdowns. Create one to start tearing slips."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((evt) => {
            const style = getEffectiveStyle(evt, globalStyle);
            const computed = computeSlipState(evt, style, nowMs);
            const isActive = evt.id === activeEventId;

            return (
              <div
                key={evt.id}
                className={`rounded-xl border bg-card p-3.5 transition-colors ${
                  isActive ? "border-primary ring-1 ring-primary/30" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectEvent(evt.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-foreground">{evt.title}</span>
                      {isActive && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          <Check className="h-3 w-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {evt.startDate} → {evt.targetDate} · {evt.rules.unit}
                    </p>
                  </button>
                  <div className="text-right">
                    <div className="font-display text-2xl font-semibold leading-none tabular-nums text-foreground">
                      {computed.formattedCountdown}
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {computed.elapsedPct.toFixed(1)}% done
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-1 border-t border-border pt-2.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => openEdit(evt)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Rules & Dates
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onDuplicateEvent(evt.id)}
                      aria-label={`Duplicate ${evt.title}`}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onToggleArchive(evt.id)}
                      aria-label={evt.archived ? `Unarchive ${evt.title}` : `Archive ${evt.title}`}
                    >
                      {evt.archived ? (
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      ) : (
                        <Archive className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDeleteEvent(evt.id)}
                      aria-label={`Delete ${evt.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event & Countdown Rules Drawer */}
      <Drawer open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DrawerContent className="mx-auto max-w-md">
          <DrawerHeader className="text-left">
            <DrawerTitle>{isNew ? "New Countdown Event" : "Edit Event & Rules"}</DrawerTitle>
            <DrawerDescription>
              Configure dates, countdown unit, formatting, progress, and milestone triggers.
            </DrawerDescription>
          </DrawerHeader>
          {editing && (
            <ScrollArea className="max-h-[70vh] px-4 pb-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="evt-title">Event Title</Label>
                  <Input
                    id="evt-title"
                    placeholder="e.g., Tokyo Trip, Exam Day"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="evt-start">Start Date</Label>
                    <Input
                      id="evt-start"
                      type="date"
                      value={editing.startDate}
                      onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="evt-target">Target Date</Label>
                    <Input
                      id="evt-target"
                      type="date"
                      value={editing.targetDate}
                      onChange={(e) => setEditing({ ...editing, targetDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Countdown Unit</Label>
                  <Select
                    value={editing.rules.unit}
                    onValueChange={(v) => updateRules("unit", v as CountdownUnit)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Plain Number Format</Label>
                      <p className="text-xs text-muted-foreground">
                        Show raw number (e.g. 1072 down to 0) with no prefix/suffix
                      </p>
                    </div>
                    <Switch
                      checked={editing.rules.plainNumber}
                      onCheckedChange={(v) => updateRules("plainNumber", v)}
                    />
                  </div>
                  {!editing.rules.plainNumber && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Prefix</Label>
                        <Input
                          placeholder="T-"
                          value={editing.rules.prefix}
                          onChange={(e) => updateRules("prefix", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Suffix</Label>
                        <Input
                          placeholder=" left"
                          value={editing.rules.suffix}
                          onChange={(e) => updateRules("suffix", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Progress Display</Label>
                  <Select
                    value={editing.rules.progressMode}
                    onValueChange={(v) => updateRules("progressMode", v as ProgressMode)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Elapsed (0→100%) & Remaining (100→0%)</SelectItem>
                      <SelectItem value="elapsed">Elapsed Progress Only (0.0% → 100%)</SelectItem>
                      <SelectItem value="remaining">Remaining Progress Only (100% → 0%)</SelectItem>
                      <SelectItem value="none">Hide Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Monthly Milestone Rule</Label>
                    <Switch
                      checked={editing.rules.monthlyMilestoneEnabled}
                      onCheckedChange={(v) => updateRules("monthlyMilestoneEnabled", v)}
                    />
                  </div>
                  {editing.rules.monthlyMilestoneEnabled && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Day (1–31)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          value={editing.rules.monthlyMilestoneDay}
                          onChange={(e) =>
                            updateRules("monthlyMilestoneDay", Number(e.target.value) || 1)
                          }
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Milestone Label</Label>
                        <Input
                          value={editing.rules.monthlyMilestoneLabel}
                          onChange={(e) => updateRules("monthlyMilestoneLabel", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Final Countdown Window</Label>
                    <Switch
                      checked={editing.rules.finalWindowEnabled}
                      onCheckedChange={(v) => updateRules("finalWindowEnabled", v)}
                    />
                  </div>
                  {editing.rules.finalWindowEnabled && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Final N Days</Label>
                        <Input
                          type="number"
                          min={1}
                          max={3650}
                          value={editing.rules.finalWindowDays}
                          onChange={(e) =>
                            updateRules("finalWindowDays", Number(e.target.value) || 30)
                          }
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Window Label</Label>
                        <Input
                          value={editing.rules.finalWindowLabel}
                          onChange={(e) => updateRules("finalWindowLabel", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleSave}>
                    Save Event
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}