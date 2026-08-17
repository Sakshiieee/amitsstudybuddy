import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/studyos/AppShell";
import { Pill, PopCard, SectionTitle, StatTile } from "@/components/studyos/bits";
import { Timeline } from "@/components/studyos/Timeline";
import {
  DAY_TYPE_META,
  DAY_TYPES,
  fmtDuration,
  isoDate,
  type DayType,
} from "@/lib/studyos/core";
import { useLogs, useProfile, useSession, useTasks } from "@/lib/studyos/data";
import { buildDay, dayStats, dayTypeFor } from "@/lib/studyos/schedule";

export const Route = createFileRoute("/plan")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Weekly plan — StudyOS" },
      {
        name: "description",
        content:
          "Every day type in one place: school days, alternate coaching days, online days, Saturdays and Sundays, block by block.",
      },
      { property: "og:title", content: "Weekly plan — StudyOS" },
      { property: "og:description", content: "The full timetable, block by block." },
    ],
  }),
  component: () => (
    <AppShell>
      <PlanView />
    </AppShell>
  ),
});

function PlanView() {
  const { userId } = useSession();
  const { data: profile } = useProfile(userId);
  const { data: tasks = [] } = useTasks(userId);
  const today = isoDate();
  const { data: logs = [] } = useLogs(userId, today, today);

  const todayType = dayTypeFor(new Date(), profile?.settings);
  const [dayType, setDayType] = useState<DayType | null>(null);
  const active = dayType ?? todayType;
  const meta = DAY_TYPE_META[active];

  const items = useMemo(
    () => buildDay(tasks, active === todayType ? logs : [], active),
    [tasks, logs, active, todayType],
  );
  const stats = dayStats(items);
  const studyMinutes = items
    .filter((i) => i.task.kind === "study" || i.task.kind === "revision")
    .reduce((a, i) => a + (i.task.end_min - i.task.start_min), 0);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl font-extrabold">THE PLAN 🗓️</h1>
        <p className="text-sm text-muted-foreground">
          Built from your planner. Tap a day type to see how it runs.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {DAY_TYPES.map((d) => (
          <button key={d} onClick={() => setDayType(d)} className="tap-pop">
            <Pill
              tone={DAY_TYPE_META[d].tone}
              className={d === active ? "" : "opacity-45"}
            >
              {DAY_TYPE_META[d].emoji} {DAY_TYPE_META[d].label}
            </Pill>
          </button>
        ))}
      </div>

      <PopCard tone={meta.tone}>
        <p className="font-display text-xl font-extrabold uppercase">
          {meta.emoji} {meta.label}
        </p>
        <p className="text-sm text-muted-foreground">{meta.sub}</p>
      </PopCard>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Blocks" value={items.length} tone="school" />
        <StatTile label="Study time" value={fmtDuration(studyMinutes)} tone="alternate" />
        <StatTile
          label="Planned"
          value={fmtDuration(stats.plannedMinutes)}
          tone="online"
        />
      </div>

      <section>
        <SectionTitle>{active === todayType ? "Today" : meta.label} schedule</SectionTitle>
        <Timeline items={items} />
      </section>
    </div>
  );
}
