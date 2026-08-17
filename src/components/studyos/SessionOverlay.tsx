import { Pause, Play, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fmtClock, fmtTime, isBreakKind, kindMeta, MOTIVATION } from "@/lib/studyos/core";
import {
  type Profile,
  type Task,
  type TaskLog,
  logFocusEvent,
  useCompleteTask,
  useUpdateLog,
} from "@/lib/studyos/data";
import { minActiveSeconds } from "@/lib/studyos/schedule";
import { cn } from "@/lib/utils";

import { Bar, Confetti, Eyebrow } from "./bits";

const BREAK_IDEAS = ["Walk 🚶", "Stretch 🤸", "Talk to someone 💬", "Fresh air 🌤️", "Volleyball 🏐", "Water 💧"];

export function SessionOverlay({
  task,
  log,
  profile,
  onClose,
}: {
  task: Task;
  log: TaskLog;
  profile: Profile;
  onClose: () => void;
}) {
  const isBreak = isBreakKind(task.kind);
  const durationSec = (task.end_min - task.start_min) * 60;
  const required = minActiveSeconds(task, profile.settings.minActivePct);

  const [activeSeconds, setActiveSeconds] = useState(log.active_seconds ?? 0);
  const [paused, setPaused] = useState(false);
  const [interruptions, setInterruptions] = useState(log.interruptions ?? 0);
  const [phase, setPhase] = useState<"running" | "verify" | "done">("running");
  const [reflection, setReflection] = useState("");
  const [rating, setRating] = useState(3);
  const [result, setResult] = useState<{ xp: number; leveledUp: boolean; level: { name: string; level: number } } | null>(null);
  const hiddenAt = useRef<number | null>(null);

  const complete = useCompleteTask(profile);
  const updateLog = useUpdateLog();
  const motivation = useMemo(
    () => MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)]!,
    [],
  );

  useEffect(() => {
    if (phase !== "running" || paused) return;
    const id = window.setInterval(() => setActiveSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase, paused]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt.current = Date.now();
      } else if (hiddenAt.current) {
        const away = (Date.now() - hiddenAt.current) / 1000;
        hiddenAt.current = null;
        if (away > 20) {
          setInterruptions((n) => n + 1);
          void logFocusEvent(profile.id, log.id, away);
          toast.warning("⚠️ Focus interrupted", {
            description: `This tab was inactive for ${Math.round(away / 60) || 1} min. Logged, not judged.`,
          });
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [log.id, profile.id]);

  // Persist progress every 30s so nothing is lost on refresh.
  useEffect(() => {
    if (phase !== "running" || activeSeconds === 0 || activeSeconds % 30 !== 0) return;
    updateLog.mutate({ id: log.id, patch: { active_seconds: activeSeconds, interruptions } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSeconds]);

  const remaining = Math.max(0, durationSec - activeSeconds);
  const progress = Math.min(100, (activeSeconds / durationSec) * 100);
  const enoughTime = activeSeconds >= required;
  const partial = !enoughTime;

  const submit = async () => {
    const res = await complete.mutateAsync({
      log,
      task,
      activeSeconds,
      interruptions,
      reflection: reflection.trim() || undefined,
      rating,
      partial,
    });
    setResult(res);
    setPhase("done");
  };

  if (phase === "done" && result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-5">
        <Confetti show />
        <div className="card-pop animate-pop-in w-full max-w-sm p-6 text-center">
          <p className="text-4xl">{partial ? "✅" : "🔥"}</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold">
            {partial ? "SESSION LOGGED" : "SESSION COMPLETE"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {task.title} — active for {fmtClock(activeSeconds)}
          </p>
          <p className="mt-4 font-display text-3xl font-extrabold" style={{ color: "var(--success)" }}>
            +{result.xp} XP
          </p>
          {result.leveledUp && (
            <p className="mt-2 font-bold" style={{ color: "var(--alternate)" }}>
              🎉 LEVEL UP — Level {result.level.level} · {result.level.name}
            </p>
          )}
          <p className="mt-3 text-sm font-semibold">
            {partial
              ? "Short session logged honestly. That still counts."
              : "Clean work. Next mission unlocked."}
          </p>
          <Button className="mt-5 w-full" onClick={onClose}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "verify") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-5">
        <div className="card-pop animate-pop-in w-full max-w-sm space-y-4 p-5">
          <Eyebrow>Quick check · not a test</Eyebrow>
          <h2 className="font-display text-xl font-extrabold">Wrap up {task.title}</h2>
          <div
            className="rounded-xl border-2 border-dashed p-3 text-xs"
            style={{ borderColor: enoughTime ? "var(--success)" : "var(--warn)" }}
          >
            Your session was active for <b>{fmtClock(activeSeconds)}</b> of a planned{" "}
            {fmtClock(durationSec)}
            {interruptions > 0 ? ` · ${interruptions} interruption(s) recorded` : ""}.
            {!enoughTime && (
              <>
                {" "}
                That's below your {profile.settings.minActivePct}% rule, so this logs as a{" "}
                <b>partial session (half XP)</b>. No shame — just honest data.
              </>
            )}
          </div>
          <div>
            <p className="mb-1 text-sm font-bold">Which topic did you work on / what did you learn?</p>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="One line is enough."
              className="border-2 border-ink"
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-bold">Rate your understanding</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={cn(
                    "tap-pop size-10 rounded-xl border-2 border-ink font-display font-extrabold",
                    rating === n ? "bg-accent" : "bg-paper",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setPhase("running")}>
              Keep going
            </Button>
            <Button
              className="flex-1"
              disabled={
                complete.isPending || (task.requires_reflection && reflection.trim().length < 3)
              }
              onClick={submit}
            >
              {complete.isPending ? "Saving…" : "Finish"}
            </Button>
          </div>
          {task.requires_reflection && reflection.trim().length < 3 && (
            <p className="text-[11px] text-muted-foreground">
              This block needs a one-line reflection before it can be marked done.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6"
      style={{ background: isBreak ? "var(--accent)" : "var(--background)" }}
    >
      <div className="flex w-full max-w-md items-center justify-between">
        <p className="eyebrow">{isBreak ? "🌿 Reset break" : "🎯 Focus mode"}</p>
        <button onClick={onClose} className="tap-pop rounded-full border-2 border-ink p-1.5">
          <X className="size-4" />
        </button>
      </div>

      <div className="w-full max-w-md text-center">
        <p className="eyebrow text-muted-foreground">{kindMeta(task.kind).label} · {task.subject}</p>
        <h1 className="font-display text-3xl font-extrabold uppercase">{task.title}</h1>
        <p className="mt-1 text-sm font-bold text-muted-foreground">
          {fmtTime(task.start_min)} – {fmtTime(task.end_min)}
        </p>

        <p className="mt-8 font-mono text-6xl font-bold tabular-nums">{fmtClock(remaining)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          active {fmtClock(activeSeconds)} · {interruptions} interruption
          {interruptions === 1 ? "" : "s"}
        </p>
        <Bar value={progress} tone={isBreak ? "online" : "sunday"} className="mt-4" />

        <p className="mt-6 text-sm font-bold italic">
          {isBreak ? "Go outside. No gadgets." : `"${motivation}"`}
        </p>

        {isBreak && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {BREAK_IDEAS.map((b) => (
              <span key={b} className="rounded-full border-2 border-ink bg-paper px-2 py-0.5 text-[11px] font-bold">
                {b}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex w-full max-w-md gap-2">
        {!isBreak && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setPaused((p) => !p);
              if (!paused) toast("Paused. Timer stops — so does the credit.");
            }}
          >
            {paused ? <Play className="mr-1 size-4" /> : <Pause className="mr-1 size-4" />}
            {paused ? "Resume" : "Pause"}
          </Button>
        )}
        <Button className="flex-1" onClick={() => setPhase(isBreak ? "verify" : "verify")}>
          {isBreak ? "Break done" : "Finish session"}
        </Button>
      </div>
    </div>
  );
}
