import { Check } from "lucide-react";

import { fmtTimeShort, kindMeta } from "@/lib/studyos/core";
import type { DayItem } from "@/lib/studyos/schedule";
import { cn } from "@/lib/utils";

const STATE_META: Record<string, { label: string; tone: string }> = {
  upcoming: { label: "Upcoming", tone: "muted-foreground" },
  current: { label: "Now", tone: "sunday" },
  active: { label: "In session", tone: "sunday" },
  completed: { label: "Done", tone: "success" },
  partial: { label: "Partial", tone: "warn" },
  missed: { label: "Missed", tone: "warn" },
  skipped: { label: "Skipped", tone: "muted-foreground" },
  overdue: { label: "Not logged", tone: "warn" },
};

export function Timeline({
  items,
  onSelect,
}: {
  items: DayItem[];
  onSelect?: (item: DayItem) => void;
}) {
  return (
    <ol className="relative space-y-2 pl-6">
      <span className="absolute top-2 bottom-2 left-[9px] w-[2.5px] rounded bg-border" />
      {items.map((item) => {
        const meta = STATE_META[item.state]!;
        const isNow = item.state === "current" || item.state === "active";
        const done = item.state === "completed" || item.state === "partial";
        return (
          <li key={item.task.id} className="relative">
            <span
              className={cn(
                "absolute top-4 -left-6 flex size-5 items-center justify-center rounded-full border-[2.5px] border-ink bg-paper",
                isNow && "animate-pulse-ring",
              )}
              style={done ? { background: "var(--success)" } : undefined}
            >
              {done ? <Check className="size-3 text-paper" strokeWidth={4} /> : null}
            </span>
            <button
              type="button"
              onClick={() => onSelect?.(item)}
              className={cn(
                "tap-pop card-pop flex w-full items-center gap-3 p-3 text-left",
                isNow && "shadow-pop",
              )}
              style={isNow ? { borderColor: "var(--sunday)" } : undefined}
            >
              <span className="font-mono text-xs font-bold tabular-nums text-muted-foreground">
                {fmtTimeShort(item.task.start_min)}
              </span>
              <span className="text-lg">{kindMeta(item.task.kind).emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{item.task.title}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {item.task.subject} · {item.task.end_min - item.task.start_min} min
                </span>
              </span>
              <span
                className="shrink-0 text-[10px] font-extrabold uppercase"
                style={{ color: `var(--${meta.tone})` }}
              >
                {meta.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
