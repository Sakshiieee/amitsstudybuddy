export type DayType = "weekday" | "alternate" | "online" | "saturday" | "sunday";

export const DAY_TYPES: DayType[] = ["weekday", "alternate", "online", "saturday", "sunday"];

export const DAY_TYPE_META: Record<
  DayType,
  { label: string; emoji: string; tone: string; sub: string }
> = {
  weekday: { label: "Weekday", emoji: "🏫", tone: "school", sub: "School day" },
  alternate: { label: "Alternate Day", emoji: "🔁", tone: "alternate", sub: "Rotation" },
  online: { label: "Online Day", emoji: "💻", tone: "online", sub: "Online class" },
  saturday: { label: "Saturday", emoji: "⚡", tone: "saturday", sub: "Allen 5–8 PM" },
  sunday: { label: "Sunday", emoji: "🌤️", tone: "sunday", sub: "Allen 8–3:30" },
};

export const DEFAULT_DAY_MAP: Record<string, DayType> = {
  "0": "sunday",
  "1": "weekday",
  "2": "alternate",
  "3": "online",
  "4": "online",
  "5": "weekday",
  "6": "saturday",
};

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export type TaskKind =
  | "study"
  | "break"
  | "exercise"
  | "meal"
  | "sleep"
  | "school"
  | "class"
  | "coaching"
  | "wrap";

export const KIND_META: Record<TaskKind, { emoji: string; label: string }> = {
  study: { emoji: "📚", label: "Study" },
  break: { emoji: "🌿", label: "Break" },
  exercise: { emoji: "💪", label: "Exercise" },
  meal: { emoji: "🍽️", label: "Meal" },
  sleep: { emoji: "🌙", label: "Sleep" },
  school: { emoji: "🎒", label: "School" },
  class: { emoji: "💻", label: "Class" },
  coaching: { emoji: "⚡", label: "Coaching" },
  wrap: { emoji: "📝", label: "Wrap up" },
};

export const SUBJECTS = [
  "Maths",
  "Physics",
  "Chemistry",
  "Biology",
  "Science",
  "SST",
  "English",
  "Kannada",
  "PCMB",
  "School",
  "General",
];

export function kindMeta(kind: string) {
  return KIND_META[kind as TaskKind] ?? KIND_META.study;
}

/** Tasks that run a real timed session. */
export function isSessionKind(kind: string) {
  return ["study", "exercise", "class", "coaching", "wrap"].includes(kind);
}

export function isBreakKind(kind: string) {
  return ["break", "meal"].includes(kind);
}

export function fmtTime(min: number) {
  const m = ((min % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${suffix}`;
}

export function fmtTimeShort(min: number) {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function fmtDuration(totalMin: number) {
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  if (h <= 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function fmtClock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function minutesNow(d = new Date()) {
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

export function isoDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function prettyDate(d = new Date()) {
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

/* ---------------- Levels ---------------- */

export const LEVELS = [
  { level: 1, name: "Rookie", min: 0 },
  { level: 2, name: "Getting Serious", min: 1500 },
  { level: 3, name: "Locked In", min: 4000 },
  { level: 4, name: "Consistency Beast", min: 9000 },
  { level: 5, name: "Board Boss", min: 18000 },
];

export function levelFor(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) current = l;
  const next = LEVELS.find((l) => l.min > xp);
  const span = next ? next.min - current.min : 1;
  const progress = next ? Math.min(1, (xp - current.min) / span) : 1;
  return { ...current, next, progress, toNext: next ? next.min - xp : 0 };
}

/* ---------------- Badges ---------------- */

export type BadgeDef = { code: string; emoji: string; name: string; hint: string };

export const BADGES: BadgeDef[] = [
  { code: "streak_3", emoji: "🔥", name: "3-Day Streak", hint: "Complete 3 days in a row" },
  { code: "streak_7", emoji: "🔥", name: "7-Day Streak", hint: "Complete 7 days in a row" },
  { code: "perfect_10", emoji: "🎯", name: "10 Perfect Sessions", hint: "10 full-length sessions" },
  { code: "hours_100", emoji: "📚", name: "100 Study Hours", hint: "100 hours of active study" },
  { code: "early_bird", emoji: "⚡", name: "Early Bird", hint: "Finish a task before 7:00 AM" },
  { code: "revision_machine", emoji: "🧠", name: "Revision Machine", hint: "20 revision sessions" },
  { code: "weekly_finisher", emoji: "🏆", name: "Weekly Finisher", hint: "A full week at 80%+" },
  { code: "first_mission", emoji: "🚀", name: "First Mission", hint: "Complete your first session" },
];

/* ---------------- Daily score ---------------- */

export type ScoreBreakdown = {
  label: string;
  score: number;
  max: number;
}[];

export function dailyScore(input: {
  completedSessions: number;
  totalSessions: number;
  onTime: number;
  missed: number;
  revisionDone: boolean;
  revisionPlanned: boolean;
  focusRatio: number;
  sleepLogged: boolean;
}): { total: number; breakdown: ScoreBreakdown } {
  const sessions =
    input.totalSessions > 0
      ? Math.round((input.completedSessions / input.totalSessions) * 40)
      : 0;
  const adherenceBase = input.completedSessions + input.missed;
  const adherence =
    adherenceBase > 0 ? Math.round((input.onTime / adherenceBase) * 30) : 0;
  const revision = input.revisionPlanned ? (input.revisionDone ? 15 : 0) : 15;
  const focus = Math.round(Math.min(1, input.focusRatio) * 10);
  const sleep = input.sleepLogged ? 5 : 0;
  const breakdown: ScoreBreakdown = [
    { label: "Study sessions", score: sessions, max: 40 },
    { label: "Timetable adherence", score: adherence, max: 30 },
    { label: "Revision", score: revision, max: 15 },
    { label: "Focus", score: focus, max: 10 },
    { label: "Sleep target", score: sleep, max: 5 },
  ];
  return { total: breakdown.reduce((a, b) => a + b.score, 0), breakdown };
}

export const NON_NEGOTIABLES = [
  { emoji: "🔥", title: "Exercise", sub: "daily, no skipping" },
  { emoji: "📵", title: "No gadgets", sub: "during breaks" },
  { emoji: "📚", title: "Allen practice", sub: "same-day" },
  { emoji: "🌙", title: "Sleep on time", sub: "protect the night" },
];

export const MOTIVATION = [
  "Not extreme. Just consistent.",
  "One mission at a time.",
  "Show up. Lock in. Level up.",
  "Small effort, repeated daily.",
  "Discipline weighs ounces. Regret weighs tons.",
  "You don't need motivation. You have a plan.",
];
