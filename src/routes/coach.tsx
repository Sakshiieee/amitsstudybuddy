import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/studyos/AppShell";
import { Eyebrow, PopCard } from "@/components/studyos/bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askCoach } from "@/lib/studyos/coach.functions";
import { DAY_TYPE_META, fmtTime, isoDate, levelFor, prettyDate } from "@/lib/studyos/core";
import { useLogs, useProfile, useSession, useTasks, useTests } from "@/lib/studyos/data";
import { buildDay, currentItem, dayStats, dayTypeFor, nextItem } from "@/lib/studyos/schedule";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coach")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "AI study coach — StudyOS" },
      {
        name: "description",
        content:
          "Ask your StudyOS coach how to recover a missed block, plan revision, or beat procrastination — with your real timetable in context.",
      },
      { property: "og:title", content: "AI study coach — StudyOS" },
      { property: "og:description", content: "A coach that knows your actual schedule." },
    ],
  }),
  component: () => (
    <AppShell>
      <CoachView />
    </AppShell>
  ),
});

const QUICK = [
  "I don't feel like studying today",
  "How do I revise for my next test?",
  "I missed my evening block — what now?",
  "Make my Sunday more effective",
];

type Msg = { role: "user" | "assistant"; content: string };

function CoachView() {
  const { userId } = useSession();
  const { data: profile } = useProfile(userId);
  const { data: tasks = [] } = useTasks(userId);
  const today = isoDate();
  const { data: logs = [] } = useLogs(userId, today, today);
  const { data: tests = [] } = useTests(userId);
  const ask = useServerFn(askCoach);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const dayType = dayTypeFor(new Date(), profile?.settings);
  const items = buildDay(tasks, logs, dayType);
  const stats = dayStats(items);
  const now = currentItem(items);
  const next = nextItem(items);
  const level = levelFor(profile?.xp ?? 0);

  const context = [
    `Name: ${profile?.name ?? "student"}`,
    `Date: ${prettyDate()} (${DAY_TYPE_META[dayType].label})`,
    `Streak: ${profile?.streak ?? 0} days, XP ${profile?.xp ?? 0}, Level ${level.level} ${level.name}`,
    `Today: ${stats.done}/${stats.total} blocks done (${stats.pct}%), ${Math.round(stats.activeMinutes)} active minutes`,
    now ? `Right now: ${now.task.title} (${fmtTime(now.task.start_min)}-${fmtTime(now.task.end_min)})` : "Right now: no scheduled block",
    next ? `Next: ${next.task.title} at ${fmtTime(next.task.start_min)}` : "",
    `Missed/unlogged today: ${items.filter((i) => i.state === "overdue" || i.state === "missed").map((i) => i.task.title).join(", ") || "none"}`,
    tests.length ? `Upcoming tests: ${tests.slice(0, 3).map((t) => `${t.subject} ${t.name} on ${t.test_date}`).join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const send = async (question: string) => {
    if (!question.trim() || busy) return;
    const history = messages.slice(-8);
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setBusy(true);
    try {
      const res = await ask({ data: { question, context, history } });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Coach dropped the call. Try that again?" },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col gap-4">
      <header>
        <h1 className="font-display text-3xl font-extrabold">COACH 🤖</h1>
        <p className="text-sm text-muted-foreground">
          Knows your timetable, your streak and what you skipped. No lectures.
        </p>
      </header>

      {messages.length === 0 && (
        <PopCard tone="online">
          <Eyebrow>Start here</Eyebrow>
          <div className="mt-2 grid gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="tap-pop rounded-xl border-2 border-ink bg-paper px-3 py-2 text-left text-sm font-bold"
              >
                {q}
              </button>
            ))}
          </div>
        </PopCard>
      )}

      <div className="flex-1 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl border-[2.5px] border-ink px-3 py-2 text-sm whitespace-pre-wrap",
              m.role === "user" ? "ml-auto bg-accent font-bold" : "bg-card shadow-pop-sm",
            )}
          >
            {m.content}
          </div>
        ))}
        {busy && (
          <div className="max-w-[85%] rounded-2xl border-[2.5px] border-ink bg-card px-3 py-2 text-sm">
            Coach is thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-20 flex gap-2 md:bottom-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={1}
          placeholder="Ask anything…"
          className="min-h-11 flex-1 resize-none border-[2.5px] border-ink bg-card"
        />
        <Button onClick={() => send(input)} disabled={busy || !input.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
