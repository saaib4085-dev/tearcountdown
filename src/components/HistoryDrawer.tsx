import { format } from "date-fns";
import { RotateCcw, Trash2 } from "lucide-react";
import type { TearLogEntry } from "@/lib/countdown-types";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  entries: TearLogEntry[];
  onUndoLast: () => void;
  onRestoreDate: (isoDate: string) => void;
  onClearHistory: () => void;
}

export function HistoryDrawer({
  open,
  onOpenChange,
  eventTitle,
  entries,
  onUndoLast,
  onRestoreDate,
  onClearHistory,
}: HistoryDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md">
        <DrawerHeader className="flex flex-row items-center justify-between text-left">
          <div>
            <DrawerTitle>Tear-Off History</DrawerTitle>
            <DrawerDescription>{eventTitle}</DrawerDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={onUndoLast} disabled={entries.length === 0}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Undo
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={onClearHistory}
              disabled={entries.length === 0}
              aria-label="Clear history"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <ScrollArea className="max-h-[55vh] px-4 pb-6">
          {entries.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No slips torn yet. Swipe or tap the calendar slip to tear off a day.
            </p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {entry.tornDateIso}
                      </span>
                      <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-secondary-foreground">
                        #{entry.sequenceNumber}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Remaining: {entry.remainingAtTear} · Torn{" "}
                      {format(new Date(entry.tornAtIso), "MMM d, h:mm a")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      onRestoreDate(entry.tornDateIso);
                      onOpenChange(false);
                    }}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}