import { DayType, DEFAULT_DAY_MAP, isSessionKind, isoDate, minutesNow } from "./core";
import type { Settings, Task, TaskLog } from "./data";

export type ItemState =
  | "upcoming"
  | "current"
  | "active"
  | "completed"
  | "partial"
  | "missed"
  | "skipped"
  | "overdue";

export type DayItem = {
  task: Task;
  log: TaskLog | null;
  state: ItemState;
};

export function dayTypeFor(date: Date, settings?: Settings | null): DayType {
  const map = settings?.dayMap ?? DEFAULT_DAY_MAP;
  return (map[String(date.getDay())] ?? DEFAULT_DAY_MAP[String(date.getDay())]!) as DayType;
}

export function buildDay(
  tasks: Task[],
  logs: TaskLog[],
  dayType: DayType,
  date = new Date(),
): DayItem[] {
  const dateKey = isoDate(date);
  const isToday = dateKey === isoDate();
  const now = isToday ? minutesNow(date) : 24 * 60;
  const byTask = new Map(logs.filter((l) => l.log_date === dateKey).map((l) => [l.task_id, l]));

  return tasks
    .filter((t) => t.day_type === dayType && t.active)
    .sort((a, b) => a.start_min - b.start_min)
    .map((task) => {
      const log = byTask.get(task.id) ?? null;
      let state: ItemState;
      if (log && log.status !== "active") {
        state = log.status as ItemState;
      } else if (log && log.status === "active") {
        state = "active";
      } else if (now >= task.end_min) {
        state = "overdue";
      } else if (now >= task.start_min) {
        state = "current";
      } else {
        state = "upcoming";
      }
      return { task, log, state };
    });
}

export function currentItem(items: DayItem[]): DayItem | null {
  return (
    items.find((i) => i.state === "active") ??
    items.find((i) => i.state === "current") ??
    null
  );
}

export function nextItem(items: DayItem[]): DayItem | null {
  return items.find((i) => i.state === "upcoming") ?? null;
}

/** The most recent block whose window has passed with nothing logged. */
export function offScheduleItem(items: DayItem[]): DayItem | null {
  const now = minutesNow();
  const overdue = items.filter(
    (i) => i.state === "overdue" && isSessionKind(i.task.kind) && now - i.task.end_min < 240,
  );
  return overdue.length ? overdue[overdue.length - 1]! : null;
}

export function dayStats(items: DayItem[]) {
  const countable = items.filter((i) => i.task.kind !== "school");
  const done = countable.filter((i) => i.state === "completed" || i.state === "partial");
  const missed = countable.filter((i) => i.state === "missed" || i.state === "overdue");
  const activeSeconds = items.reduce((sum, i) => sum + (i.log?.active_seconds ?? 0), 0);
  const xp = items.reduce((sum, i) => sum + (i.log?.xp_awarded ?? 0), 0);
  const pct = countable.length ? Math.round((done.length / countable.length) * 100) : 0;
  const plannedMinutes = countable
    .filter((i) => isSessionKind(i.task.kind))
    .reduce((s, i) => s + (i.task.end_min - i.task.start_min), 0);
  return {
    total: countable.length,
    done: done.length,
    missed: missed.length,
    pct,
    activeMinutes: Math.round(activeSeconds / 60),
    plannedMinutes,
    xp,
  };
}

export function minActiveSeconds(task: Task, minActivePct: number) {
  const duration = (task.end_min - task.start_min) * 60;
  return Math.round((duration * Math.min(100, Math.max(10, minActivePct))) / 100);
}

export const MISS_REASONS = [
  "School ran late",
  "Coaching ran late",
  "I wasn't feeling well",
  "Family reason",
  "I got distracted",
  "Other",
];
