import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eyebrow, PopCard } from "@/components/studyos/bits";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — StudyOS study coach" },
      {
        name: "description",
        content: "Sign in to StudyOS to run your daily study missions, streaks and focus sessions.",
      },
      { property: "og:title", content: "Sign in — StudyOS" },
      { property: "og:description", content: "Your personal study command center." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Amit");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/" });
    });
  }, [navigate]);

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      await navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <div className="text-center">
        <Eyebrow>Class 10 · Boards + Allen Foundation</Eyebrow>
        <h1 className="font-display text-4xl font-extrabold">
          Study<span style={{ color: "var(--sunday)" }}>OS</span>
        </h1>
        <p className="mt-1 text-sm font-bold italic" style={{ color: "var(--sunday)" }}>
          "Not extreme. Just consistent."
        </p>
      </div>

      <PopCard className="animate-pop-in space-y-3">
        <div className="flex gap-2">
          <Button
            variant={mode === "signup" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("signup")}
          >
            Create account
          </Button>
          <Button
            variant={mode === "signin" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("signin")}
          >
            Sign in
          </Button>
        </div>

        {mode === "signup" && (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="border-2 border-ink"
          />
        )}
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border-2 border-ink"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border-2 border-ink"
        />
        <Button className="w-full" disabled={busy || !email || !password} onClick={submit}>
          {busy ? "…" : mode === "signup" ? "Start my plan 🔥" : "Let's go"}
        </Button>
      </PopCard>
    </div>
  );
}
