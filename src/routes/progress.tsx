import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { AppShell } from "@/components/studyos/AppShell";
import { Bar, Eyebrow, PopCard, SectionTitle, StatTile } from "@/components/studyos/bits";
import { BADGES, fmtDuration, isoDate, levelFor } from "@/lib/studyos/core";
import { useAchievements, useLogs, useProfile, useSession, useTasks } from "@/lib/studyos/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/progress")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Progress & badges — StudyOS" },
      {
        name: "description",
        content:
          "See your last 14 days of study consistency, subject balance, XP growth, level and unlocked badges.",
      },
      { property: "og:title", content: "Progress & badges — StudyOS" },
      { property: "og:description", content: "Consistency beats intensity — here's the proof." },
    ],
  }),
  component: () => (
    <AppShell>
      <ProgressView />
    </AppShell>
  ),
});

function ProgressView() {
  const { userId } = useSession();
  const { data: profile } = useProfile(userId);
  const { data: tasks = [] } = useTasks(userId);
  const { data: achievements = [] } = useAchievements(userId);

  const to = isoDate();
  const from = isoDate(new Date(Date.now() - 13 * 86400000));
  const { data: logs = [] } = useLogs(userId, from, to);

  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  const days = useMemo(() => {
    const out: { date: string; minutes: number; done: number; xp: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = isoDate(new Date(Date.now() - i * 86400000));
      const dayLogs = logs.filter((l) => l.log_date === date);
      out.push({
        date,
        minutes: Math.round(dayLogs.reduce((a, l) => a + l.active_seconds, 0) / 60),
        done: dayLogs.filter((l) => l.status === "completed" || l.status === "partial").length,
        xp: dayLogs.reduce((a, l) => a + l.xp_awarded, 0),
      });
    }
    return out;
  }, [logs]);

  const maxMin = Math.max(30, ...days.map((d) => d.minutes));
  const totalMinutes = days.reduce((a, d) => a + d.minutes, 0);
  const activeDays = days.filter((d) => d.done > 0).length;
  const level = levelFor(profile?.xp ?? 0);

  const bySubject = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of logs) {
      const t = taskById.get(l.task_id);
      if (!t || l.active_seconds < 60) continue;
      map.set(t.subject, (map.get(t.subject) ?? 0) + Math.round(l.active_seconds / 60));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [logs, taskById]);
  const maxSubject = Math.max(1, ...bySubject.map((s) => s[1]));

  const earned = new Set(achievements.map((a) => a.code));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl font-extrabold">PROGRESS 📈</h1>
        <p className="text-sm text-muted-foreground">Last 14 days. Honest numbers only.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Study time" value={fmtDuration(totalMinutes)} tone="school" />
        <StatTile label="Active days" value={`${activeDays}/14`} tone="success" />
        <StatTile label="Streak" value={profile?.streak ?? 0} emoji="🔥" tone="sunday" />
        <StatTile label="Best streak" value={profile?.longest_streak ?? 0} tone="alternate" />
      </div>

      <PopCard>
        <div className="flex items-center justify-between text-xs font-bold">
          <span>
            Level {level.level} · {level.name}
          </span>
          <span className="text-muted-foreground">{profile?.xp ?? 0} XP total</span>
        </div>
        <Bar value={level.progress * 100} tone="xp" className="mt-2" />
      </PopCard>

      <PopCard>
        <Eyebrow>Daily study minutes</Eyebrow>
        <div className="mt-3 flex h-32 items-end gap-1">
          {days.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md border-2 border-ink"
                style={{
                  height: `${Math.max(4, (d.minutes / maxMin) * 100)}%`,
                  background: d.minutes > 0 ? "var(--success)" : "var(--muted)",
                }}
                title={`${d.date}: ${d.minutes} min`}
              />
              <span className="text-[9px] font-bold text-muted-foreground">
                {d.date.slice(8)}
              </span>
            </div>
          ))}
        </div>
      </PopCard>

      <PopCard>
        <Eyebrow>Subject balance</Eyebrow>
        {bySubject.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Log a few sessions and the balance shows up here.
          </p>
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
        <SectionTitle>Badges</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BADGES.map((b) => {
            const got = earned.has(b.code);
            return (
              <div
                key={b.code}
                className={cn(
                  "card-pop p-3 text-center",
                  !got && "opacity-45 grayscale",
                )}
              >
                <p className="text-2xl">{b.emoji}</p>
                <p className="text-sm font-extrabold">{b.name}</p>
                <p className="text-[11px] text-muted-foreground">{b.hint}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
