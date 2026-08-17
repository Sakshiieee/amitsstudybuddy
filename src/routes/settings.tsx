import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/studyos/AppShell";
import { Eyebrow, Pill, PopCard, SectionTitle } from "@/components/studyos/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { DAY_TYPE_META, DAY_TYPES, WEEKDAY_NAMES, type DayType } from "@/lib/studyos/core";
import { useProfile, useSession, useUpdateProfile, type Settings } from "@/lib/studyos/data";

export const Route = createFileRoute("/settings")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Settings — StudyOS" },
      {
        name: "description",
        content:
          "Tune your StudyOS: which weekday runs which schedule, focus-timer strictness, reminders and parent access.",
      },
      { property: "og:title", content: "Settings — StudyOS" },
      { property: "og:description", content: "Make the plan match your real week." },
    ],
  }),
  component: () => (
    <AppShell>
      <SettingsView />
    </AppShell>
  ),
});

function SettingsView() {
  const { userId } = useSession();
  const { data: profile } = useProfile(userId);
  const update = useUpdateProfile();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setSettings(profile.settings);
  }, [profile]);

  if (!profile || !settings) return null;

  const save = () => {
    update.mutate(
      { id: profile.id, patch: { name, settings } },
      { onSuccess: () => toast.success("Saved ✅") },
    );
  };

  const set = (patch: Partial<Settings>) => setSettings({ ...settings, ...patch });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl font-extrabold">SETTINGS ⚙️</h1>
        <p className="text-sm text-muted-foreground">Make the plan match your real week.</p>
      </header>

      <PopCard className="space-y-2">
        <Eyebrow>Your name</Eyebrow>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-2 border-ink"
        />
      </PopCard>

      <section>
        <SectionTitle>Weekly day map</SectionTitle>
        <div className="space-y-2">
          {WEEKDAY_NAMES.map((day, i) => (
            <PopCard key={day} className="flex flex-wrap items-center gap-2">
              <span className="w-24 text-sm font-extrabold">{day}</span>
              <div className="flex flex-wrap gap-1.5">
                {DAY_TYPES.map((d) => (
                  <button
                    key={d}
                    className="tap-pop"
                    onClick={() =>
                      set({ dayMap: { ...settings.dayMap, [String(i)]: d as DayType } })
                    }
                  >
                    <Pill
                      tone={DAY_TYPE_META[d].tone}
                      className={settings.dayMap[String(i)] === d ? "" : "opacity-40"}
                    >
                      {DAY_TYPE_META[d].emoji} {DAY_TYPE_META[d].label}
                    </Pill>
                  </button>
                ))}
              </div>
            </PopCard>
          ))}
        </div>
      </section>

      <PopCard className="space-y-3">
        <Eyebrow>Focus rules</Eyebrow>
        <div>
          <div className="flex justify-between text-sm font-bold">
            <span>Minimum active time to count fully</span>
            <span>{settings.minActivePct}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={95}
            step={5}
            value={settings.minActivePct}
            onChange={(e) => set({ minActivePct: Number(e.target.value) })}
            className="mt-2 w-full accent-[var(--sunday)]"
          />
          <p className="text-[11px] text-muted-foreground">
            Below this, a session logs as partial with half XP. Anti-cheat, not punishment.
          </p>
        </div>
        <Row
          label="In-app reminders"
          sub="Nudges 10 minutes before a block"
          checked={settings.notifications}
          onChange={(v) => set({ notifications: v })}
        />
        <Row
          label="Sound effects"
          sub="Little wins deserve a little noise"
          checked={settings.sounds}
          onChange={(v) => set({ sounds: v })}
        />
      </PopCard>

      <PopCard className="space-y-3" tone="online">
        <Eyebrow>Parent dashboard</Eyebrow>
        <Row
          label="Share a weekly summary"
          sub="Read-only stats. No reflections, no chat history."
          checked={settings.parentAccess}
          onChange={(v) => set({ parentAccess: v })}
        />
        <Textarea
          value={settings.parentNote ?? ""}
          onChange={(e) => set({ parentNote: e.target.value })}
          placeholder="Optional note for your parents"
          className="border-2 border-ink"
        />
      </PopCard>

      <div className="flex gap-2">
        <Button className="flex-1" onClick={save} disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save changes"}
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            await navigate({ to: "/auth" });
          }}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-bold">{label}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
