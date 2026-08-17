import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bot, CalendarDays, Flame, Home, LibraryBig } from "lucide-react";
import { type ReactNode, useEffect } from "react";

import { cn } from "@/lib/utils";
import { useProfile, useSession } from "@/lib/studyos/data";

import { Onboarding } from "./Onboarding";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/plan", label: "Plan", icon: CalendarDays },
  { to: "/subjects", label: "Subjects", icon: LibraryBig },
  { to: "/progress", label: "Progress", icon: Flame },
  { to: "/coach", label: "Coach", icon: Bot },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { userId, ready } = useSession();
  const navigate = useNavigate();
  const profileQuery = useProfile(userId);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && !userId) void navigate({ to: "/auth" });
  }, [ready, userId, navigate]);

  if (!ready || (userId && profileQuery.isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse font-display text-2xl font-extrabold">StudyOS</div>
      </div>
    );
  }

  if (!userId) return null;

  const profile = profileQuery.data;
  if (profile && !profile.onboarded) {
    return <Onboarding profile={profile} />;
  }

  return (
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col gap-1 border-r-[2.5px] border-ink bg-paper p-4 md:flex">
        <Link to="/" className="mb-4 block">
          <p className="eyebrow text-muted-foreground">Class 10 · Boards</p>
          <p className="font-display text-2xl font-extrabold">
            Study<span style={{ color: "var(--sunday)" }}>OS</span>
          </p>
        </Link>
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} active={pathname === item.to} desktop />
        ))}
        <div className="mt-3 border-t-2 border-dashed border-border pt-3">
          <NavItem to="/tests" label="Tests" icon={CalendarDays} active={pathname === "/tests"} desktop />
          <NavItem to="/parent" label="Parent view" icon={Home} active={pathname === "/parent"} desktop />
          <NavItem to="/settings" label="Settings" icon={LibraryBig} active={pathname === "/settings"} desktop />
        </div>
      </aside>

      <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-28 md:max-w-4xl md:pb-10">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t-[2.5px] border-ink bg-paper md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1.5">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} active={pathname === item.to} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
  desktop,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  desktop?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "tap-pop flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold",
        desktop ? "w-full" : "flex-1 flex-col gap-0.5 px-1 text-[10px]",
        active ? "border-2 border-ink bg-accent" : "border-2 border-transparent",
      )}
    >
      <Icon className={desktop ? "size-4" : "size-5"} strokeWidth={2.6} />
      <span>{label}</span>
    </Link>
  );
}
