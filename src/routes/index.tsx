import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Layers, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { createInitialAppState } from "@/lib/countdown-defaults";
import {
  computeSlipState,
  getEffectiveStyle,
  getTodayIso,
  shiftIsoDate,
} from "@/lib/countdown-engine";
import { generateId, loadAppState, saveAppState } from "@/lib/countdown-store";
import type {
  AppState,
  CountdownEvent,
  CountdownUnit,
  SlipStyleConfig,
  StylePreset,
} from "@/lib/countdown-types";
import { EventsManager } from "@/components/EventsManager";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { StyleStudioDrawer } from "@/components/StyleStudioDrawer";
import { TearOffCalendar } from "@/components/TearOffCalendar";
import { WidgetsView } from "@/components/WidgetsView";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SlipDay — Digital Tear-Off Countdown Calendar" },
      {
        name: "description",
        content:
          "Mobile-first digital tear-off countdown calendar with swipe physics, live style studio, multi-event rules, and home-screen widget previews.",
      },
      { property: "og:title", content: "SlipDay — Digital Tear-Off Countdown Calendar" },
      {
        property: "og:description",
        content:
          "Mobile-first digital tear-off countdown calendar with swipe physics, live style studio, multi-event rules, and home-screen widget previews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SlipDayApp,
});

type MainTab = "calendar" | "widgets" | "events";

const QUICK_UNITS: CountdownUnit[] = [
  "days",
  "hours",
  "minutes",
  "seconds",
  "weeks",
  "months",
  "years",
];

function SlipDayApp() {
  const [state, setState] = useState<AppState>(() => createInitialAppState());
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTab>("calendar");
  const [studioOpen, setStudioOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [nowMs, setNowMs] = useState<number>(0);

  // Hydrate persisted state & client clock safely after mount
  useEffect(() => {
    setState(loadAppState());
    setNowMs(Date.now());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveAppState(state);
  }, [state, hydrated]);

  const activeEvent = useMemo<CountdownEvent | undefined>(() => {
    return (
      state.events.find((e) => e.id === state.activeEventId) ??
      state.events.find((e) => !e.archived) ??
      state.events[0]
    );
  }, [state.events, state.activeEventId]);

  const needsLiveTick =
    activeEvent?.rules.unit === "seconds" ||
    activeEvent?.rules.unit === "minutes" ||
    activeEvent?.rules.unit === "hours";

  useEffect(() => {
    if (!hydrated || !needsLiveTick) return;
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hydrated, needsLiveTick]);

  const activeStyle = activeEvent
    ? getEffectiveStyle(activeEvent, state.globalStyle)
    : state.globalStyle;

  const computed = useMemo(() => {
    if (!activeEvent) return null;
    return computeSlipState(activeEvent, activeStyle, nowMs || undefined);
  }, [activeEvent, activeStyle, nowMs]);

  const activeHistory = useMemo(
    () =>
      activeEvent ? state.tearHistory.filter((entry) => entry.eventId === activeEvent.id) : [],
    [state.tearHistory, activeEvent],
  );

  const updateActiveEvent = (updater: (evt: CountdownEvent) => CountdownEvent) => {
    if (!activeEvent) return;
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === activeEvent.id ? updater(e) : e)),
    }));
  };

  const handleTearOff = () => {
    if (!activeEvent || !computed) return;
    const entry = {
      id: generateId("tear"),
      eventId: activeEvent.id,
      tornDateIso: activeEvent.currentSlipDate,
      remainingAtTear: computed.formattedCountdown,
      tornAtIso: new Date().toISOString(),
      sequenceNumber: computed.sequenceNumber,
    };
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === activeEvent.id
          ? { ...e, currentSlipDate: shiftIsoDate(e.currentSlipDate, 1) }
          : e,
      ),
      tearHistory: [entry, ...prev.tearHistory].slice(0, 120),
    }));
  };

  const handleUndo = () => {
    if (!activeEvent) return;
    const latest = activeHistory[0];
    if (!latest) return;
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === activeEvent.id ? { ...e, currentSlipDate: latest.tornDateIso } : e,
      ),
      tearHistory: prev.tearHistory.filter((item) => item.id !== latest.id),
    }));
    toast.success(`Restored slip for ${latest.tornDateIso}`);
  };

  const handleShiftDate = (delta: number) => {
    updateActiveEvent((evt) => ({
      ...evt,
      currentSlipDate: shiftIsoDate(evt.currentSlipDate, delta),
    }));
  };

  const handleJumpToday = () => {
    updateActiveEvent((evt) => ({
      ...evt,
      currentSlipDate: getTodayIso(),
    }));
  };

  const handleQuickUnitChange = (unit: CountdownUnit) => {
    updateActiveEvent((evt) => ({
      ...evt,
      rules: { ...evt.rules, unit },
    }));
  };

  const handleChangeStyle = (nextStyle: SlipStyleConfig) => {
    if (!activeEvent) return;
    if (activeEvent.useCustomStyle) {
      updateActiveEvent((evt) => ({ ...evt, style: nextStyle }));
    } else {
      setState((prev) => ({ ...prev, globalStyle: nextStyle }));
    }
  };

  const handleToggleEventOverride = (useCustom: boolean) => {
    updateActiveEvent((evt) => ({
      ...evt,
      useCustomStyle: useCustom,
      style: useCustom ? structuredClone(state.globalStyle) : evt.style,
    }));
  };

  const handleSavePreset = (name: string, scope: "global" | "event") => {
    const preset: StylePreset = {
      id: generateId("custom-preset"),
      name,
      scope,
      style: structuredClone(activeStyle),
    };
    setState((prev) => ({ ...prev, presets: [preset, ...prev.presets] }));
  };

  const handleApplyPreset = (preset: StylePreset) => {
    handleChangeStyle(structuredClone(preset.style));
  };

  const handleDeletePreset = (id: string) => {
    setState((prev) => ({
      ...prev,
      presets: prev.presets.filter((p) => p.id !== id),
    }));
  };

  const handleUpsertEvent = (evt: CountdownEvent, activate?: boolean) => {
    setState((prev) => {
      const exists = prev.events.some((e) => e.id === evt.id);
      const events = exists
        ? prev.events.map((e) => (e.id === evt.id ? evt : e))
        : [evt, ...prev.events];
      return {
        ...prev,
        events,
        activeEventId: activate || !prev.activeEventId ? evt.id : prev.activeEventId,
      };
    });
  };

  const handleDuplicateEvent = (id: string) => {
    const src = state.events.find((e) => e.id === id);
    if (!src) return;
    const copy: CountdownEvent = {
      ...structuredClone(src),
      id: generateId("evt"),
      title: `${src.title} (Copy)`,
      archived: false,
    };
    setState((prev) => ({
      ...prev,
      events: [copy, ...prev.events],
      activeEventId: copy.id,
    }));
    toast.success(`Duplicated "${src.title}"`);
  };

  const handleToggleArchive = (id: string) => {
    setState((prev) => {
      const events = prev.events.map((e) =>
        e.id === id ? { ...e, archived: !e.archived } : e,
      );
      const nextActive =
        prev.activeEventId === id
          ? (events.find((e) => !e.archived)?.id ?? events[0]?.id ?? "")
          : prev.activeEventId;
      return { ...prev, events, activeEventId: nextActive };
    });
  };

  const handleDeleteEvent = (id: string) => {
    setState((prev) => {
      const events = prev.events.filter((e) => e.id !== id);
      const nextActive =
        prev.activeEventId === id
          ? (events.find((e) => !e.archived)?.id ?? events[0]?.id ?? "")
          : prev.activeEventId;
      return {
        ...prev,
        events,
        activeEventId: nextActive,
        tearHistory: prev.tearHistory.filter((h) => h.eventId !== id),
      };
    });
    toast.success("Event deleted");
  };

  const activeSelectableEvents = state.events.filter((e) => !e.archived);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background text-foreground">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-background/90 px-4 py-2.5 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            SlipDay
          </span>
          {activeEvent && activeSelectableEvents.length > 0 && (
            <Select
              value={activeEvent.id}
              onValueChange={(id) => setState((prev) => ({ ...prev, activeEventId: id }))}
            >
              <SelectTrigger
                className="h-8 max-w-[165px] rounded-full border-border bg-card px-3 text-xs font-medium"
                aria-label="Switch active countdown"
              >
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {activeSelectableEvents.map((evt) => (
                  <SelectItem key={evt.id} value={evt.id} className="text-xs">
                    {evt.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Quick Unit Switcher (seconds / minutes / hours / days / weeks / months / years) */}
        {activeEvent && (
          <Select
            value={activeEvent.rules.unit}
            onValueChange={(v) => handleQuickUnitChange(v as CountdownUnit)}
          >
            <SelectTrigger
              className="h-8 w-[96px] rounded-full border-border bg-secondary/70 px-2.5 font-mono text-[11px] uppercase"
              aria-label="Countdown unit"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUICK_UNITS.map((unit) => (
                <SelectItem key={unit} value={unit} className="font-mono text-xs uppercase">
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </header>

      {/* Main View */}
      <main className="flex flex-1 flex-col overflow-x-hidden pb-20">
        {activeTab === "calendar" && activeEvent && computed && (
          <TearOffCalendar
            event={activeEvent}
            styleConfig={activeStyle}
            computed={computed}
            nowMs={nowMs}
            canUndo={activeHistory.length > 0}
            historyCount={activeHistory.length}
            onTearOff={handleTearOff}
            onUndo={handleUndo}
            onShiftDate={handleShiftDate}
            onJumpToday={handleJumpToday}
            onOpenHistory={() => setHistoryOpen(true)}
            onOpenStudio={() => setStudioOpen(true)}
          />
        )}

        {activeTab === "calendar" && !activeEvent && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              No countdown events yet. Create your first event in the Events tab.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("events")}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Go to Events
            </button>
          </div>
        )}

        {activeTab === "widgets" && activeEvent && computed && (
          <WidgetsView
            event={activeEvent}
            styleConfig={activeStyle}
            computed={computed}
            onOpenStudio={() => setStudioOpen(true)}
          />
        )}

        {activeTab === "events" && (
          <EventsManager
            events={state.events}
            activeEventId={activeEvent?.id ?? ""}
            globalStyle={state.globalStyle}
            nowMs={nowMs}
            onSelectEvent={(id) => {
              setState((prev) => ({ ...prev, activeEventId: id }));
              setActiveTab("calendar");
            }}
            onUpsertEvent={handleUpsertEvent}
            onDuplicateEvent={handleDuplicateEvent}
            onToggleArchive={handleToggleArchive}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-center justify-around border-t border-border bg-card/95 px-2 py-2 backdrop-blur-md"
      >
        <button
          type="button"
          onClick={() => setActiveTab("calendar")}
          className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium transition-colors ${
            activeTab === "calendar" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <CalendarDays className="h-5 w-5" />
          Calendar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("widgets")}
          className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium transition-colors ${
            activeTab === "widgets" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <LayoutGrid className="h-5 w-5" />
          Widgets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("events")}
          className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium transition-colors ${
            activeTab === "events" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Layers className="h-5 w-5" />
          Events
        </button>
        <button
          type="button"
          onClick={() => setStudioOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <SlidersHorizontal className="h-5 w-5" />
          Studio
        </button>
      </nav>

      {/* Live Style Studio Drawer */}
      {activeEvent && (
        <StyleStudioDrawer
          open={studioOpen}
          onOpenChange={setStudioOpen}
          event={activeEvent}
          activeStyle={activeStyle}
          presets={state.presets}
          onChangeStyle={handleChangeStyle}
          onToggleEventOverride={handleToggleEventOverride}
          onSavePreset={handleSavePreset}
          onApplyPreset={handleApplyPreset}
          onDeletePreset={handleDeletePreset}
        />
      )}

      {/* Tear-Off History Drawer */}
      {activeEvent && (
        <HistoryDrawer
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          eventTitle={activeEvent.title}
          entries={activeHistory}
          onUndoLast={handleUndo}
          onRestoreDate={(iso) => {
            updateActiveEvent((evt) => ({ ...evt, currentSlipDate: iso }));
            toast.success(`Jumped to ${iso}`);
          }}
          onClearHistory={() => {
            setState((prev) => ({
              ...prev,
              tearHistory: prev.tearHistory.filter((h) => h.eventId !== activeEvent.id),
            }));
            toast.success("History cleared");
          }}
        />
      )}
    </div>
  );
}
