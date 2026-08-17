import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { AppShell } from "@/components/studyos/AppShell";
import { Bar, Eyebrow, PopCard, SectionTitle, StatTile } from "@/components/studyos/bits";
import { fmtDuration, isoDate, levelFor } from "@/lib/studyos/core";
import { useLogs, useProfile, useSession, useTasks } from "@/lib/studyos/data";

export const Route = createFileRoute("/parent")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Parent view — StudyOS" },
      {
        name: "description",
        content:
          "A calm, read-only weekly summary for parents: hours studied, consistency, subject balance and how to support without nagging.",
      },
      { property: "og:title", content: "Parent view — StudyOS" },
      { property: "og:description", content: "Support without nagging — the weekly summary." },
    ],
  }),
  component: () => (
    <AppShell>
      <ParentView />
    </AppShell>
  ),
});

function ParentView() {
  const { userId } = useSession();
  const { data: profile } = useProfile(userId);
  const { data: tasks = [] } = useTasks(userId);
  const to = isoDate();
  const from = isoDate(new Date(Date.now() - 6 * 86400000));
  const { data: logs = [] } = useLogs(userId, from, to);

  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  if (profile && !profile.settings.parentAccess) {
    return (
      <PopCard>
        <Eyebrow>Parent view</Eyebrow>
        <p className="mt-1 text-sm font-bold">Sharing is currently off.</p>
        <p className="text-sm text-muted-foreground">
          Turn on “Share a weekly summary” in Settings to show this page to your parents. Only
          stats are shared — never reflections or coach chats.
        </p>
      </PopCard>
    );
  }

  const minutes = Math.round(logs.reduce((a, l) => a + l.active_seconds, 0) / 60);
  const completed = logs.filter((l) => l.status === "completed").length;
  const partial = logs.filter((l) => l.status === "partial").length;
  const missed = logs.filter((l) => l.status === "missed").length;
  const activeDays = new Set(logs.filter((l) => l.active_seconds > 0).map((l) => l.log_date)).size;
  const level = levelFor(profile?.xp ?? 0);

  const bySubject = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of logs) {
      const t = taskById.get(l.task_id);
      if (!t || l.active_seconds < 60) continue;
      map.set(t.subject, (map.get(t.subject) ?? 0) + Math.round(l.active_seconds / 60));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [logs, taskById]);
  const maxSubject = Math.max(1, ...bySubject.map((s) => s[1]));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl font-extrabold">PARENT VIEW 👨‍👩‍👦</h1>
        <p className="text-sm text-muted-foreground">
          Last 7 days for {profile?.name}. Read-only, shared by {profile?.name}.
        </p>
      </header>

      {profile?.settings.parentNote && (
        <PopCard tone="accent">
          <Eyebrow>Note from {profile.name}</Eyebrow>
          <p className="mt-1 text-sm font-semibold">{profile.settings.parentNote}</p>
        </PopCard>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Study time" value={fmtDuration(minutes)} tone="school" />
        <StatTile label="Days active" value={`${activeDays}/7`} tone="success" />
        <StatTile label="Streak" value={profile?.streak ?? 0} emoji="🔥" tone="sunday" />
        <StatTile label="Level" value={level.level} sub={level.name} tone="alternate" />
      </div>

      <PopCard>
        <Eyebrow>Sessions</Eyebrow>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <Cell label="Completed" value={completed} tone="success" />
          <Cell label="Partial" value={partial} tone="warn" />
          <Cell label="Missed" value={missed} tone="sunday" />
        </div>
      </PopCard>

      <PopCard>
        <Eyebrow>Subject balance</Eyebrow>
        {bySubject.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No sessions logged this week yet.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {bySubject.map(([subject, mins]) => (
              <div key={subject}>
                <div className="flex justify-between text-xs font-bold">
                  <span>{subject}</span>
                  <span className="text-muted-foreground">{fmtDuration(mins)}</span>
                </div>
                <Bar value={(mins / maxSubject) * 100} tone="school" />
              </div>
            ))}
          </div>
        )}
      </PopCard>

      <section>
        <SectionTitle>How to help this week</SectionTitle>
        <PopCard tone="online">
          <ul className="space-y-1.5 text-sm font-semibold">
            <li>▸ Ask “what did you study today?” — not “did you study?”</li>
            <li>▸ Protect the sleep window and the outdoor break. Both are non-negotiable.</li>
            <li>▸ Partial sessions are honest data, not failure. Praise the logging.</li>
            <li>▸ One bad day doesn't break a plan. Consistency beats intensity.</li>
          </ul>
        </PopCard>
      </section>
    </div>
  );
}

function Cell({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border-2 border-ink p-2">
      <p className="font-display text-xl font-extrabold" style={{ color: `var(--${tone})` }}>
        {value}
      </p>
      <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
    </div>
  );
}
