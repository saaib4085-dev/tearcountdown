import { useRef, useState } from "react";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  History,
  RotateCcw,
  Scissors,
  SlidersHorizontal,
} from "lucide-react";
import { computeSlipState, getTodayIso, shiftIsoDate } from "@/lib/countdown-engine";
import type { ComputedSlipState, CountdownEvent, SlipStyleConfig } from "@/lib/countdown-types";
import { Button } from "@/components/ui/button";
import { SlipFace } from "./SlipFace";

interface TearOffCalendarProps {
  event: CountdownEvent;
  styleConfig: SlipStyleConfig;
  computed: ComputedSlipState;
  nowMs: number;
  canUndo: boolean;
  historyCount: number;
  onTearOff: () => void;
  onUndo: () => void;
  onShiftDate: (deltaDays: number) => void;
  onJumpToday: () => void;
  onOpenHistory: () => void;
  onOpenStudio: () => void;
}

interface FlyingSlipSnapshot {
  id: number;
  event: CountdownEvent;
  computed: ComputedSlipState;
}

export function TearOffCalendar({
  event,
  styleConfig,
  computed,
  nowMs,
  canUndo,
  historyCount,
  onTearOff,
  onUndo,
  onShiftDate,
  onJumpToday,
  onOpenHistory,
  onOpenStudio,
}: TearOffCalendarProps) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [flyingSlip, setFlyingSlip] = useState<FlyingSlipSnapshot | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const tearCounterRef = useRef(0);

  const { layout } = styleConfig;

  const triggerTear = () => {
    if (flyingSlip) return;
    tearCounterRef.current += 1;
    setFlyingSlip({
      id: tearCounterRef.current,
      event: { ...event },
      computed,
    });
    onTearOff();
    window.setTimeout(() => {
      setFlyingSlip(null);
    }, layout.animationSpeedMs + 40);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (flyingSlip) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    if (Math.hypot(dx, dy) > 8) {
      pointerStartRef.current.moved = true;
    }
    setDragOffset({ x: dx * 0.65, y: dy * 0.65 });
  };

  const handlePointerUp = () => {
    if (!pointerStartRef.current) return;
    const dist = Math.hypot(dragOffset.x, dragOffset.y);
    const wasTap = !pointerStartRef.current.moved;
    pointerStartRef.current = null;
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });

    if (dist >= 56 || wasTap) {
      triggerTear();
    }
  };

  const dragRotation = Math.max(-14, Math.min(14, dragOffset.x * 0.08));
  const dragProgress = Math.min(1, Math.hypot(dragOffset.x, dragOffset.y) / 70);

  const nextDayEvent: CountdownEvent = {
    ...event,
    currentSlipDate: shiftIsoDate(event.currentSlipDate, 1),
  };
  const nextComputed = computeSlipState(nextDayEvent, styleConfig, nowMs);

  const isToday = event.currentSlipDate === getTodayIso();
  const stackCount = Math.max(0, Math.min(6, layout.stackDepth));
  const animClass = `animate-tear-${layout.tearDirection}`;

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-4 px-4 pb-3 pt-2">
      {/* Calendar Mount & Tear-Off Stack */}
      <div className="relative mx-auto flex w-full max-w-[340px] flex-col items-center">
        {/* Physical Desk Binding Bar */}
        <div className="z-30 -mb-2 flex h-7 w-[88%] items-center justify-between rounded-t-lg border border-border bg-foreground/90 px-5 shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-background/40 ring-2 ring-background/20" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/70">
            {event.rules.unit} · {computed.activeTier ? computed.activeTier.label : "active slip"}
          </span>
          <span className="h-2.5 w-2.5 rounded-full bg-background/40 ring-2 ring-background/20" />
        </div>

        {/* Stack Stage */}
        <div className="relative w-full">
          {/* Underneath Paper Stack */}
          {Array.from({ length: stackCount }).map((_, idx) => {
            const depth = stackCount - idx;
            const offsetY = depth * 4;
            const scaleX = 1 - depth * 0.015;
            return (
              <div
                key={depth}
                className="pointer-events-none absolute inset-0"
                style={{
                  transform: `translateY(${offsetY}px) scaleX(${scaleX})`,
                  zIndex: idx + 1,
                  opacity: 0.96 - depth * 0.08,
                }}
                aria-hidden="true"
              >
                <SlipFace
                  event={nextDayEvent}
                  styleConfig={styleConfig}
                  computed={nextComputed}
                  showTearEdge={false}
                />
              </div>
            );
          })}

          {/* Active Interactive Slip */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`Tear off slip for ${computed.formattedDate}. ${computed.formattedCountdown} remaining.`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              pointerStartRef.current = null;
              setIsDragging(false);
              setDragOffset({ x: 0, y: 0 });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                triggerTear();
              }
            }}
            className="relative z-20 cursor-grab touch-none active:cursor-grabbing"
            style={{
              transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragRotation}deg)`,
              transition: isDragging ? "none" : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <SlipFace event={event} styleConfig={styleConfig} computed={computed} />
            {isDragging && dragProgress > 0.2 && (
              <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
                <span className="rounded-full bg-foreground/85 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-background">
                  {dragProgress >= 0.8 ? "Release to tear" : "Keep pulling"}
                </span>
              </div>
            )}
          </div>

          {/* Flying Torn Slip Overlay */}
          {flyingSlip && (
            <div
              key={flyingSlip.id}
              className={`pointer-events-none absolute inset-0 z-40 ${animClass}`}
              style={{ animationDuration: `${layout.animationSpeedMs}ms` }}
            >
              <SlipFace
                event={flyingSlip.event}
                styleConfig={styleConfig}
                computed={flyingSlip.computed}
              />
            </div>
          )}
        </div>
      </div>

      {/* Interactive Hint + Date & Tear Controls */}
      <div className="w-full max-w-[360px] space-y-2.5 pt-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 flex-1 gap-1.5"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Undo
          </Button>
          <Button size="sm" className="h-9 flex-[1.5] gap-1.5" onClick={triggerTear}>
            <Scissors className="h-3.5 w-3.5" />
            Tear Off Slip
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 px-3"
            onClick={onOpenHistory}
            aria-label="Open tear history log"
          >
            <History className="h-3.5 w-3.5" />
            <span className="tabular-nums text-xs">{historyCount}</span>
          </Button>
        </div>

        {/* Date & Progress Controls */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-2.5 py-1.5">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onShiftDate(-1)}
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={isToday ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1 px-2.5 text-xs"
              onClick={onJumpToday}
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onShiftDate(1)}
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium text-primary"
            onClick={onOpenStudio}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Style Studio
          </Button>
        </div>
      </div>
    </div>
  );
}