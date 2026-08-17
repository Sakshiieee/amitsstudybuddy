import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  question: z.string().min(1).max(2000),
  context: z.string().max(4000).default(""),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(12)
    .default([]),
});

const SYSTEM = `You are "Coach", the study coach inside StudyOS — an app for Amit, a Class 10 student in India preparing for CBSE boards plus Allen Foundation coaching.

Voice: warm, direct, big-brother energy. Short paragraphs, no lecturing, no guilt, no exclamation spam. Speak to a teenager like a person, not a motivational poster.

Rules:
- Answer with concrete next actions tied to his real timetable and time of day.
- If he is behind, normalise it in one line, then give one small recovery step.
- Never suggest all-nighters, skipping sleep, skipping meals, or dropping his volleyball / outdoor break. Those are non-negotiables.
- Prefer active recall, spaced revision, past papers and NCERT for boards; concept + problem sets for Allen.
- Keep replies under 160 words unless he asks for a full plan.`;

export const askCoach = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { reply: "Coach is offline right now. Try again in a bit." };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "system", content: `Live student context:\n${data.context}` },
          ...data.history,
          { role: "user", content: data.question },
        ],
      }),
    });

    if (res.status === 429) {
      return { reply: "Coach is catching a breath (rate limit). Ask again in a minute." };
    }
    if (!res.ok) {
      console.error("coach gateway error", res.status, await res.text());
      return { reply: "Coach couldn't answer that one. Try rephrasing?" };
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { reply: json.choices?.[0]?.message?.content ?? "…" };
  });
