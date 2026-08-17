import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/studyos/AppShell";
import { Eyebrow, Pill, PopCard, SectionTitle } from "@/components/studyos/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { isoDate, SUBJECTS } from "@/lib/studyos/core";
import { useSession, useTests } from "@/lib/studyos/data";

export const Route = createFileRoute("/tests")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Test radar — StudyOS" },
      {
        name: "description",
        content:
          "Track upcoming school and Allen tests, see the countdown, and get a spaced revision plan for each one.",
      },
      { property: "og:title", content: "Test radar — StudyOS" },
      { property: "og:description", content: "Countdowns and revision plans for every test." },
    ],
  }),
  component: () => (
    <AppShell>
      <TestsView />
    </AppShell>
  ),
});

function revisionPlan(days: number) {
  if (days <= 1) return ["Skim notes + formula sheet", "Do 1 past paper section", "Sleep on time — memory needs it"];
  if (days <= 3)
    return [
      "Day 1: active recall of weak chapters",
      "Day 2: full practice set, mark mistakes",
      "Final day: mistakes + formula sheet only",
    ];
  return [
    "Split the syllabus across the days ahead",
    "Every session: 20 min concept, 25 min problems",
    "Two days before: full-length practice paper",
    "Last day: only mistakes and formula sheet",
  ];
}

function TestsView() {
  const { userId } = useSession();
  const { data: tests = [] } = useTests(userId);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    subject: SUBJECTS[0] ?? "Maths",
    test_date: isoDate(),
    syllabus: "",
    priority: "high",
  });

  const addTest = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tests").insert({ ...form, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["studyos", "tests"] });
      setOpen(false);
      setForm((f) => ({ ...f, name: "", syllabus: "" }));
      toast.success("Test added to the radar 📝");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeTest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["studyos", "tests"] }),
  });

  const today = new Date(isoDate());

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">TEST RADAR 📝</h1>
          <p className="text-sm text-muted-foreground">Countdowns and a revision plan each.</p>
        </div>
        <Button onClick={() => setOpen((o) => !o)}>{open ? "Close" : "Add test"}</Button>
      </header>

      {open && (
        <PopCard className="animate-pop-in space-y-2" tone="saturday">
          <Eyebrow>New test</Eyebrow>
          <Input
            placeholder="Test name (e.g. Unit Test 2)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border-2 border-ink"
          />
          <div className="flex gap-2">
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="h-10 flex-1 rounded-md border-2 border-ink bg-card px-2 text-sm font-bold"
            >
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <Input
              type="date"
              value={form.test_date}
              onChange={(e) => setForm({ ...form, test_date: e.target.value })}
              className="flex-1 border-2 border-ink"
            />
          </div>
          <Textarea
            placeholder="Syllabus / chapters"
            value={form.syllabus}
            onChange={(e) => setForm({ ...form, syllabus: e.target.value })}
            className="border-2 border-ink"
          />
          <Button
            className="w-full"
            disabled={!form.name || addTest.isPending}
            onClick={() => addTest.mutate()}
          >
            Save test
          </Button>
        </PopCard>
      )}

      <SectionTitle>Upcoming</SectionTitle>
      {tests.length === 0 && (
        <PopCard>
          <p className="text-sm text-muted-foreground">
            No tests on the radar. Add one and I'll build the revision runway.
          </p>
        </PopCard>
      )}

      <div className="space-y-3">
        {tests.map((t) => {
          const days = Math.round(
            (new Date(t.test_date).getTime() - today.getTime()) / 86400000,
          );
          const past = days < 0;
          return (
            <PopCard key={t.id} tone={past ? undefined : days <= 3 ? "sunday" : "school"}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg font-extrabold uppercase">
                    {t.subject} · {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.test_date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone={past ? "muted-foreground" : days <= 3 ? "sunday" : "success"}>
                    {past ? "done" : days === 0 ? "today" : `${days}d`}
                  </Pill>
                  <button
                    className="tap-pop rounded-lg border-2 border-ink p-1"
                    onClick={() => removeTest.mutate(t.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              {t.syllabus && <p className="mt-2 text-sm">{t.syllabus}</p>}
              {!past && (
                <ul className="mt-2 space-y-1">
                  {revisionPlan(days).map((step) => (
                    <li key={step} className="text-xs font-semibold">
                      ▸ {step}
                    </li>
                  ))}
                </ul>
              )}
            </PopCard>
          );
        })}
      </div>
    </div>
  );
}
