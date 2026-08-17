import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import { BADGES, DayType, DEFAULT_DAY_MAP, isoDate, levelFor } from "./core";

export type Profile = {
  id: string;
  name: string;
  xp: number;
  streak: number;
  longest_streak: number;
  last_streak_date: string | null;
  onboarded: boolean;
  settings: Settings;
};

export type Settings = {
  dayMap: Record<string, DayType>;
  minActivePct: number;
  sounds: boolean;
  notifications: boolean;
  parentAccess: boolean;
  parentNote?: string;
};

export type Task = {
  id: string;
  user_id: string;
  day_type: DayType;
  start_min: number;
  end_min: number;
  title: string;
  subject: string;
  kind: string;
  xp: number;
  note: string;
  requires_reflection: boolean;
  active: boolean;
};

export type TaskLog = {
  id: string;
  user_id: string;
  task_id: string;
  log_date: string;
  status: "active" | "completed" | "partial" | "missed" | "skipped";
  active_seconds: number;
  interruptions: number;
  reflection: string | null;
  rating: number | null;
  reason: string | null;
  xp_awarded: number;
  started_at: string;
  completed_at: string | null;
};

export type TestItem = {
  id: string;
  name: string;
  subject: string;
  test_date: string;
  syllabus: string;
  priority: string;
};

/* ------------------------------------------------------------------ */

export function useSession() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { userId, ready };
}

export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      await supabase.rpc("ensure_setup", { p_name: "" });
      const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const settings = {
        dayMap: DEFAULT_DAY_MAP,
        minActivePct: 70,
        sounds: true,
        notifications: true,
        parentAccess: false,
        ...((data.settings as object) ?? {}),
      } as Settings;
      return { ...(data as unknown as Profile), settings };
    },
  });
}

export function useTasks(userId: string | null) {
  return useQuery({
    queryKey: ["tasks", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from("schedule_tasks")
        .select("*")
        .order("start_min", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Task[];
    },
  });
}

export function useLogs(userId: string | null, from: string, to: string) {
  return useQuery({
    queryKey: ["logs", userId, from, to],
    enabled: !!userId,
    queryFn: async (): Promise<TaskLog[]> => {
      const { data, error } = await supabase
        .from("task_logs")
        .select("*")
        .gte("log_date", from)
        .lte("log_date", to);
      if (error) throw error;
      return (data ?? []) as unknown as TaskLog[];
    },
  });
}

export function useTests(userId: string | null) {
  return useQuery({
    queryKey: ["tests", userId],
    enabled: !!userId,
    queryFn: async (): Promise<TestItem[]> => {
      const { data, error } = await supabase
        .from("tests")
        .select("*")
        .order("test_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as TestItem[];
    },
  });
}

export function useAchievements(userId: string | null) {
  return useQuery({
    queryKey: ["achievements", userId],
    enabled: !!userId,
    queryFn: async (): Promise<{ code: string; earned_at: string }[]> => {
      const { data, error } = await supabase.from("achievements").select("code, earned_at");
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ------------------------------------------------------------------ */

export function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["profile"] });
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["logs"] });
    qc.invalidateQueries({ queryKey: ["achievements"] });
    qc.invalidateQueries({ queryKey: ["tests"] });
  };
}

export function useStartTask(userId: string | null) {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (task: Task) => {
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("task_logs")
        .upsert(
          {
            user_id: userId,
            task_id: task.id,
            log_date: isoDate(),
            status: "active",
            started_at: new Date().toISOString(),
          },
          { onConflict: "user_id,task_id,log_date" },
        )
        .select()
        .single();
      if (error) throw error;
      return data as unknown as TaskLog;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateLog() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<TaskLog> }) => {
      const { error } = await supabase
        .from("task_logs")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export type CompletePayload = {
  log: TaskLog;
  task: Task;
  activeSeconds: number;
  interruptions: number;
  reflection?: string;
  rating?: number;
  partial: boolean;
};

export function useCompleteTask(profile: Profile | null | undefined) {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (p: CompletePayload) => {
      if (!profile) throw new Error("Not ready");
      const xp = p.partial ? Math.round(p.task.xp / 2) : p.task.xp;
      const { error } = await supabase
        .from("task_logs")
        .update({
          status: p.partial ? "partial" : "completed",
          active_seconds: p.activeSeconds,
          interruptions: p.interruptions,
          reflection: p.reflection ?? null,
          rating: p.rating ?? null,
          xp_awarded: xp,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", p.log.id);
      if (error) throw error;

      await supabase.from("xp_events").insert({
        user_id: profile.id,
        amount: xp,
        reason: `${p.task.title}${p.partial ? " (partial)" : ""}`,
      });

      const before = levelFor(profile.xp);
      const after = levelFor(profile.xp + xp);
      await supabase.from("profiles").update({ xp: profile.xp + xp }).eq("id", profile.id);

      return { xp, leveledUp: after.level > before.level, level: after };
    },
    onSuccess: invalidate,
  });
}

export function useMarkMissed() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async ({
      userId,
      taskId,
      reason,
    }: {
      userId: string;
      taskId: string;
      reason: string;
    }) => {
      const { error } = await supabase.from("task_logs").upsert(
        {
          user_id: userId,
          task_id: taskId,
          log_date: isoDate(),
          status: "missed",
          reason,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,task_id,log_date" },
      );
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateProfile() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export async function logFocusEvent(userId: string, logId: string | null, secondsAway: number) {
  await supabase.from("focus_events").insert({
    user_id: userId,
    log_id: logId,
    event_type: "tab_hidden",
    seconds_away: Math.round(secondsAway),
  });
}

/** Streak + badge bookkeeping, run after a day's progress changes. */
export async function syncStreakAndBadges(opts: {
  profile: Profile;
  todayPct: number;
  completedToday: number;
  perfectSessions: number;
  totalActiveHours: number;
  revisionSessions: number;
  earned: string[];
  finishedBefore7am: boolean;
}) {
  const { profile } = opts;
  const today = isoDate();
  let streak = profile.streak;

  if (opts.todayPct >= 70 && profile.last_streak_date !== today) {
    const yesterday = isoDate(new Date(Date.now() - 86400000));
    streak = profile.last_streak_date === yesterday ? profile.streak + 1 : 1;
    await supabase
      .from("profiles")
      .update({
        streak,
        last_streak_date: today,
        longest_streak: Math.max(profile.longest_streak, streak),
      })
      .eq("id", profile.id);
  }

  const shouldHave: string[] = [];
  if (opts.completedToday > 0) shouldHave.push("first_mission");
  if (streak >= 3) shouldHave.push("streak_3");
  if (streak >= 7) shouldHave.push("streak_7");
  if (opts.perfectSessions >= 10) shouldHave.push("perfect_10");
  if (opts.totalActiveHours >= 100) shouldHave.push("hours_100");
  if (opts.revisionSessions >= 20) shouldHave.push("revision_machine");
  if (opts.finishedBefore7am) shouldHave.push("early_bird");

  const missing = shouldHave.filter(
    (c) => !opts.earned.includes(c) && BADGES.some((b) => b.code === c),
  );
  if (missing.length) {
    await supabase
      .from("achievements")
      .upsert(
        missing.map((code) => ({ user_id: profile.id, code })),
        { onConflict: "user_id,code" },
      );
  }
  return { streak, newBadges: missing };
}
