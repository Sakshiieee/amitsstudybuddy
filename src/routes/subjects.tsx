import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { AppShell } from "@/components/studyos/AppShell";
import { Bar, Eyebrow, PopCard, SectionTitle } from "@/components/studyos/bits";
import { fmtDuration, isoDate, SUBJECTS } from "@/lib/studyos/core";
import { useLogs, useSession, useTasks } from "@/lib/studyos/data";

export const Route = createFileRoute("/subjects")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Subjects — StudyOS" },
      {
        name: "description",
        content:
          "Subject-by-subject study time, confidence ratings and the topics you logged over the last 30 days.",
      },
      { property: "og:title", content: "Subjects — StudyOS" },
      { property: "og:description", content: "Where your hours actually went." },
    ],
  }),
  component: () => (
    <AppShell>
      <SubjectsView />
    </AppShell>
  ),
});

function SubjectsView() {
  const { userId } = useSession();
  const { data: tasks = [] } = useTasks(userId);
  const to = isoDate();
  const from = isoDate(new Date(Date.now() - 29 * 86400000));
  const { data: logs = [] } = useLogs(userId, from, to);

  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  const rows = useMemo(() => {
    const map = new Map<
      string,
      { minutes: number; sessions: number; ratings: number[]; notes: { text: string; date: string }[] }
    >();
    for (const subject of SUBJECTS) {
      map.set(subject, { minutes: 0, sessions: 0, ratings: [], notes: [] });
    }
    for (const l of logs) {
      const t = taskById.get(l.task_id);
      if (!t) continue;
      const row = map.get(t.subject) ?? { minutes: 0, sessions: 0, ratings: [], notes: [] };
      row.minutes += Math.round(l.active_seconds / 60);
      if (l.active_seconds > 60) row.sessions += 1;
      if (l.rating) row.ratings.push(l.rating);
      if (l.reflection) row.notes.push({ text: l.reflection, date: l.log_date });
      map.set(t.subject, row);
    }
    return [...map.entries()]
      .map(([subject, r]) => ({
        subject,
        ...r,
        confidence: r.ratings.length
          ? r.ratings.reduce((a, b) => a + b, 0) / r.ratings.length
          : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [logs, taskById]);

  const maxMin = Math.max(1, ...rows.map((r) => r.minutes));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl font-extrabold">SUBJECTS 📚</h1>
        <p className="text-sm text-muted-foreground">Last 30 days — where your hours went.</p>
      </header>

      <SectionTitle>Time & confidence</SectionTitle>
      <div className="space-y-3">
        {rows.map((r) => (
          <PopCard key={r.subject}>
            <div className="flex items-baseline justify-between">
              <p className="font-display text-lg font-extrabold uppercase">{r.subject}</p>
              <p className="text-xs font-bold text-muted-foreground">
                {fmtDuration(r.minutes)} · {r.sessions} session{r.sessions === 1 ? "" : "s"}
              </p>
            </div>
            <Bar value={(r.minutes / maxMin) * 100} tone="school" className="mt-2" />
            <div className="mt-2 flex items-center justify-between text-xs font-bold">
              <span className="text-muted-foreground">Confidence</span>
              <span>
                {r.confidence ? `${r.confidence.toFixed(1)} / 5` : "no rating yet"}
              </span>
            </div>
            {r.confidence > 0 && r.confidence < 3 && (
              <p className="mt-1 text-[11px] font-bold" style={{ color: "var(--warn)" }}>
                ⚠️ Weak spot — give this subject the next revision slot.
              </p>
            )}
            {r.notes.length > 0 && (
              <div className="mt-2">
                <Eyebrow>Recent topics</Eyebrow>
                <ul className="mt-1 space-y-0.5">
                  {r.notes.slice(-3).reverse().map((n, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground">
                      {n.date.slice(5)} · {n.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </PopCard>
        ))}
      </div>
    </div>
  );
}
