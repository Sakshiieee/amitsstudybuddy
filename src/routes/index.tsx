import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/studyos/AppShell";
import { Bar, Eyebrow, Pill, PopCard, SectionTitle, StatTile } from "@/components/studyos/bits";
import { SessionOverlay } from "@/components/studyos/SessionOverlay";
import { Timeline } from "@/components/studyos/Timeline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DAY_TYPE_META,
  fmtDuration,
  fmtTime,
  isBreakKind,
  isoDate,
  kindMeta,
  levelFor,
  minutesNow,
  NON_NEGOTIABLES,
  prettyDate,
} from "@/lib/studyos/core";
import {
  type Task,
  type TaskLog,
  syncStreakAndBadges,
  useAchievements,
  useLogs,
  useMarkMissed,
  useProfile,
  useSession,
  useStartTask,
  useTasks,
  useTests,
} from "@/lib/studyos/data";
import {
  buildDay,
  currentItem,
  dayStats,
  dayTypeFor,
  MISS_REASONS,
  nextItem,
  offScheduleItem,
} from "@/lib/studyos/schedule";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "StudyOS — your daily study command center" },
      {
        name: "description",
        content:
          "StudyOS turns Amit's Class 10 study planner into live missions: what to do right now, focus sessions, streaks, XP and honest progress tracking.",
      },
      { property: "og:title", content: "StudyOS — your daily study command center" },
      {
        property: "og:description",
        content: "Live timetable, focus sessions, streaks and an AI study coach.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <HomeView />
    </AppShell>
  ),
});

function HomeView() {
  const { userId } = useSession();
  const { data: profile } = useProfile(userId);
  const { data: tasks = [] } = useTasks(userId);
  const today = isoDate();
  const { data: logs = [] } = useLogs(userId, today, today);
  const { data: tests = [] } = useTests(userId);
  const { data: achievements = [] } = useAchievements(userId);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 20000);
    return () => window.clearInterval(id);
  }, []);

  const startTask = useStartTask(userId);
  const markMissed = useMarkMissed();
  const [session, setSession] = useState<{ task: Task; log: TaskLog } | null>(null);
  const [missTarget, setMissTarget] = useState<Task | null>(null);
  const notified = useRef<Set<string>>(new Set());

  const dayType = dayTypeFor(new Date(), profile?.settings);
  const items = useMemo(
    () => buildDay(tasks, logs, dayType),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, logs, dayType, tick],
  );
  const stats = dayStats(items);
  const current = currentItem(items);
  const next = nextItem(items);
  const offSchedule = offScheduleItem(items);
  const level = levelFor(profile?.xp ?? 0);
  const meta = DAY_TYPE_META[dayType];

  // Gentle in-app reminders, at most one per task.
  useEffect(() => {
    if (!profile?.settings.notifications) return;
    const now = minutesNow();
    for (const item of items) {
      const key = `${item.task.id}-pre`;
      if (
        item.state === "upcoming" &&
        item.task.start_min - now <= 10 &&
        item.task.start_min - now > 0 &&
        !notified.current.has(key)
      ) {
        notified.current.add(key);
        toast(`⏰ ${item.task.title} starts in ${Math.ceil(item.task.start_min - now)} min.`);
      }
    }
  }, [items, profile?.settings.notifications]);

  // Streak + badges bookkeeping.
  useEffect(() => {
    if (!profile || stats.total === 0) return;
    const perfect = logs.filter((l) => l.status === "completed").length;
    void syncStreakAndBadges({
      profile,
      todayPct: stats.pct,
      completedToday: stats.done,
      perfectSessions: perfect,
      totalActiveHours: stats.activeMinutes / 60,
      revisionSessions: 0,
      earned: achievements.map((a) => a.code),
      finishedBefore7am: logs.some(
        (l) => l.completed_at != null && new Date(l.completed_at).getHours() < 7,
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.pct]);

  const startSession = async (task: Task) => {
    const log = await startTask.mutateAsync(task);
    setSession({ task, log });
  };

  const upcomingTest = tests.find((t) => new Date(t.test_date) >= new Date(today));
  const daysToTest = upcomingTest
    ? Math.round(
        (new Date(upcomingTest.test_date).getTime() - new Date(today).getTime()) / 86400000,
      )
    : null;

  return (
    <div className="space-y-4">
      {session && profile && (
        <SessionOverlay
          task={session.task}
          log={session.log}
          profile={profile}
          onClose={() => setSession(null)}
        />
      )}

      <header className="animate-rise">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold">
              HEY, {(profile?.name ?? "").toUpperCase()} 👋
            </h1>
            <p className="text-sm font-semibold text-muted-foreground">{prettyDate()}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-extrabold">
              <span className="inline-block animate-flame">🔥</span> {profile?.streak ?? 0}
            </p>
            <p className="eyebrow text-muted-foreground">day streak</p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Pill tone={meta.tone}>
            {meta.emoji} {meta.label}
          </Pill>
          <Pill tone="xp">⚡ {profile?.xp ?? 0} XP</Pill>
          <Pill tone="alternate">
            Lv {level.level} · {level.name}
          </Pill>
        </div>
      </header>

      {offSchedule && !session && (
        <PopCard className="animate-pop-in" tone="sunday">
          <p className="eyebrow" style={{ color: "var(--sunday)" }}>
            🚨 You're off schedule
          </p>
          <p className="mt-1 text-sm font-bold">
            {offSchedule.task.title} ended{" "}
            {Math.max(1, Math.round(minutesNow() - offSchedule.task.end_min))} min ago and wasn't
            logged.
          </p>
          <p className="text-xs text-muted-foreground">
            One block, not the whole day. Pick it up or tell me what happened.
          </p>
          <div className="mt-3 flex gap-2">
            <Button className="flex-1" onClick={() => startSession(offSchedule.task)}>
              Start now
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setMissTarget(offSchedule.task)}
            >
              I have a reason
            </Button>
          </div>
        </PopCard>
      )}

      {/* RIGHT NOW */}
      <PopCard className="animate-pop-in shadow-pop" tone={current ? "sunday" : undefined}>
        <div className="flex items-center justify-between">
          <p className="eyebrow" style={{ color: "var(--sunday)" }}>
            ⚡ Right now
          </p>
          {current && (
            <span className="font-mono text-xs font-bold">
              {Math.max(0, Math.round(current.task.end_min - minutesNow()))} min left
            </span>
          )}
        </div>

        {current ? (
          <>
            <h2 className="mt-1 font-display text-2xl font-extrabold uppercase">
              {kindMeta(current.task.kind).emoji} {current.task.title}
            </h2>
            <p className="text-sm font-bold text-muted-foreground">
              {current.task.subject} · {fmtTime(current.task.start_min)} –{" "}
              {fmtTime(current.task.end_min)}
            </p>
            <p className="mt-2 text-sm">{current.task.note}</p>
            <Bar
              className="mt-3"
              tone={isBreakKind(current.task.kind) ? "online" : "sunday"}
              value={
                ((minutesNow() - current.task.start_min) /
                  (current.task.end_min - current.task.start_min)) *
                100
              }
            />
            <Button
              className="mt-3 w-full text-base"
              size="lg"
              onClick={() => startSession(current.task)}
              disabled={startTask.isPending}
            >
              {current.state === "active"
                ? "RESUME SESSION"
                : isBreakKind(current.task.kind)
                  ? "START BREAK 🌿"
                  : "START SESSION"}
            </Button>
          </>
        ) : (
          <>
            <h2 className="mt-1 font-display text-xl font-extrabold">Nothing scheduled 🎈</h2>
            <p className="text-sm text-muted-foreground">
              {next
                ? `Next up: ${next.task.title} at ${fmtTime(next.task.start_min)}.`
                : "Day's plan is done. Protect your sleep."}
            </p>
          </>
        )}
      </PopCard>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Today" value={`${stats.pct}%`} sub={`${stats.done}/${stats.total} tasks`} tone="success" />
        <StatTile label="Study time" value={fmtDuration(stats.activeMinutes)} sub={`planned ${fmtDuration(stats.plannedMinutes)}`} tone="school" />
        <StatTile label="XP today" value={stats.xp} tone="xp" emoji="⚡" />
        <StatTile label="Level" value={level.level} sub={level.name} tone="alternate" />
      </div>

      <PopCard>
        <div className="flex items-center justify-between text-xs font-bold">
          <span>Level {level.level} · {level.name}</span>
          <span className="text-muted-foreground">
            {level.next ? `${level.toNext} XP to ${level.next.name}` : "Max level"}
          </span>
        </div>
        <Bar value={level.progress * 100} tone="alternate" className="mt-2" />
      </PopCard>

      {upcomingTest && daysToTest !== null && (
        <PopCard tone="saturday">
          <p className="eyebrow" style={{ color: "var(--saturday)" }}>
            📝 Test radar
          </p>
          <p className="font-display text-lg font-extrabold uppercase">
            {upcomingTest.subject} test in {daysToTest} day{daysToTest === 1 ? "" : "s"}
          </p>
          <p className="text-xs text-muted-foreground">{upcomingTest.name}</p>
          <Link to="/tests" className="mt-2 inline-block text-xs font-bold underline">
            Plan revision →
          </Link>
        </PopCard>
      )}

      <section>
        <SectionTitle
          right={
            <Link to="/plan" className="text-xs font-bold underline">
              Full plan →
            </Link>
          }
        >
          Today's timeline
        </SectionTitle>
        <Timeline
          items={items}
          onSelect={(item) => {
            if (item.state === "completed" || item.state === "partial") return;
            if (item.state === "overdue") setMissTarget(item.task);
            else void startSession(item.task);
          }}
        />
      </section>

      <PopCard>
        <Eyebrow>🔒 Non-negotiables</Eyebrow>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {NON_NEGOTIABLES.map((n) => (
            <div key={n.title} className="rounded-xl border-2 border-dashed border-border p-2">
              <p className="text-sm font-bold">
                {n.emoji} {n.title}
              </p>
              <p className="text-[11px] text-muted-foreground">{n.sub}</p>
            </div>
          ))}
        </div>
      </PopCard>

      <PopCard tone="online">
        <Eyebrow>🤖 Coach says</Eyebrow>
        <p className="mt-1 text-sm font-semibold">
          {stats.pct >= 80
            ? "Clean sweep energy today. You followed the plan instead of chasing motivation."
            : offSchedule
              ? "You slipped one block. Protect the next one — that's the whole game."
              : current
                ? `Start ${current.task.title} now. Ten honest minutes beats a perfect plan.`
                : "Quiet slot. Use it to prep tomorrow's first mission."}
        </p>
        <Link to="/coach" className="mt-2 inline-block text-xs font-bold underline">
          Talk to your coach →
        </Link>
      </PopCard>

      <Dialog open={!!missTarget} onOpenChange={(o) => !o && setMissTarget(null)}>
        <DialogContent className="border-[2.5px] border-ink">
          <DialogHeader>
            <DialogTitle className="font-display">What happened?</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Real reasons are fine. This just keeps your data honest.
          </p>
          <div className="grid gap-2">
            {MISS_REASONS.map((reason) => (
              <Button
                key={reason}
                variant="outline"
                onClick={() => {
                  if (!userId || !missTarget) return;
                  markMissed.mutate({ userId, taskId: missTarget.id, reason });
                  setMissTarget(null);
                  toast("Logged. Next block is the one that counts.");
                }}
              >
                {reason}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
