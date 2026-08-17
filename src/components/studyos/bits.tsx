import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PopCard({
  children,
  className,
  tone,
}: {
  children: ReactNode;
  className?: string;
  tone?: string;
}) {
  return (
    <div
      className={cn("card-pop p-4", className)}
      style={tone ? { borderColor: `var(--${tone})` } : undefined}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow text-muted-foreground", className)}>{children}</p>;
}

export function Bar({
  value,
  tone = "success",
  className,
}: {
  value: number;
  tone?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-3 w-full overflow-hidden rounded-full border-2 border-ink bg-muted",
        className,
      )}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: `var(--${tone})` }}
      />
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
  tone = "ink",
  emoji,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: string;
  emoji?: string;
}) {
  return (
    <div className="card-pop flex flex-col justify-between p-3">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold" style={{ color: `var(--${tone})` }}>
        {emoji ? <span className="mr-1">{emoji}</span> : null}
        {value}
      </p>
      {sub ? <p className="text-[11px] text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "ink",
  className,
}: {
  children: ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-0.5 text-[11px] font-bold",
        className,
      )}
      style={{ borderColor: `var(--${tone})`, color: `var(--${tone})` }}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2 flex items-end justify-between">
      <h2 className="font-display text-lg font-extrabold">{children}</h2>
      {right}
    </div>
  );
}

export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  const pieces = Array.from({ length: 28 });
  const tones = ["--sunday", "--school", "--online", "--saturday", "--success", "--alternate"];
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((_, i) => (
        <span
          key={i}
          className="absolute block h-3 w-2 rounded-[2px]"
          style={{
            left: `${(i * 37) % 100}%`,
            top: "-5%",
            background: `var(${tones[i % tones.length]})`,
            animation: `rise 0.9s ease-out ${i * 0.03}s both`,
            transform: `rotate(${i * 27}deg)`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}
