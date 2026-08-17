import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DAY_TYPE_META, DAY_TYPES, DayType, SUBJECTS, WEEKDAY_NAMES } from "@/lib/studyos/core";
import { type Profile, useUpdateProfile } from "@/lib/studyos/data";
import { cn } from "@/lib/utils";

import { Eyebrow, Pill, PopCard } from "./bits";

export function Onboarding({ profile }: { profile: Profile }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [dayMap, setDayMap] = useState<Record<string, DayType>>(profile.settings.dayMap);
  const [notifications, setNotifications] = useState(profile.settings.notifications);
  const [parentAccess, setParentAccess] = useState(profile.settings.parentAccess);
  const update = useUpdateProfile();

  const finish = () => {
    update.mutate({
      id: profile.id,
      patch: {
        name: name.trim() || "Amit",
        onboarded: true,
        settings: { ...profile.settings, dayMap, notifications, parentAccess },
      },
    });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-4 py-8">
      <div className="animate-pop-in text-center">
        <Eyebrow>Class 10 · Boards + Allen Foundation</Eyebrow>
        <h1 className="font-display text-4xl font-extrabold">
          Ready to lock in? 🔥
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your planner, turned into a daily mission system.
        </p>
      </div>

      {step === 0 && (
        <PopCard className="animate-rise space-y-3">
          <Eyebrow>Step 1 · Who is this for?</Eyebrow>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="border-2 border-ink text-lg font-bold"
          />
          <Button className="w-full" onClick={() => setStep(1)}>
            Next
          </Button>
        </PopCard>
      )}

      {step === 1 && (
        <PopCard className="animate-rise space-y-3">
          <Eyebrow>Step 2 · Confirm your week</Eyebrow>
          <p className="text-xs text-muted-foreground">
            Pick which schedule runs on each day. You can change this any time in Settings.
          </p>
          <div className="space-y-2">
            {WEEKDAY_NAMES.map((dayName, i) => (
              <div key={dayName} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-sm font-bold">{dayName}</span>
                <div className="flex flex-wrap gap-1">
                  {DAY_TYPES.map((dt) => (
                    <button
                      key={dt}
                      type="button"
                      onClick={() => setDayMap({ ...dayMap, [String(i)]: dt })}
                      className={cn(
                        "tap-pop rounded-full border-2 px-2 py-0.5 text-[11px] font-bold",
                        dayMap[String(i)] === dt
                          ? "text-primary-foreground"
                          : "border-border bg-paper",
                      )}
                      style={
                        dayMap[String(i)] === dt
                          ? {
                              background: `var(--${DAY_TYPE_META[dt].tone})`,
                              borderColor: `var(--${DAY_TYPE_META[dt].tone})`,
                              color: "var(--paper)",
                            }
                          : undefined
                      }
                    >
                      {DAY_TYPE_META[dt].emoji} {DAY_TYPE_META[dt].label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full" onClick={() => setStep(2)}>
            Next
          </Button>
        </PopCard>
      )}

      {step === 2 && (
        <PopCard className="animate-rise space-y-4">
          <Eyebrow>Step 3 · Subjects & preferences</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECTS.map((s) => (
              <Pill key={s}>{s}</Pill>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-xl border-2 border-ink p-3">
            <div>
              <p className="text-sm font-bold">In-app reminders</p>
              <p className="text-[11px] text-muted-foreground">
                Nudges 10 min before each block. No spam.
              </p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between rounded-xl border-2 border-ink p-3">
            <div>
              <p className="text-sm font-bold">Parent / guardian view</p>
              <p className="text-[11px] text-muted-foreground">
                High-level progress only. Coach chats stay private.
              </p>
            </div>
            <Switch checked={parentAccess} onCheckedChange={setParentAccess} />
          </div>
          <Button className="w-full" onClick={finish} disabled={update.isPending}>
            {update.isPending ? "Setting up…" : "Your first mission is ready →"}
          </Button>
        </PopCard>
      )}
    </div>
  );
}
