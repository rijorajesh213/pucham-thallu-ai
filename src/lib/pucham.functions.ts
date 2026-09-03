import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
  mode: z.enum(["chat", "excuse", "exam", "diet", "obvious", "thallu", "voice"]),
  intensity: z.enum(["soft", "full", "nuclear"]),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(10)
    .default([]),
});

const BattleSchema = z.object({
  player1: z.string().min(1).max(40),
  player2: z.string().min(1).max(40),
  intensity: z.enum(["soft", "full", "nuclear"]),
});

const INTENSITY_NOTE: Record<string, string> = {
  soft: "Roast level: SOFT PUCHAM. Light, friendly teasing. Very warm.",
  full: "Roast level: FULL PUCHAM. Strong sarcastic Manglish roasting, dramatic.",
  nuclear:
    "Roast level: NUCLEAR PUCHAM. Maximum funny savage roasting, extremely dramatic — but never hateful, cruel or harmful.",
};

const MODE_NOTE: Record<string, string> = {
  chat: "Normal pucham chat.",
  excuse: "EXCUSE ROASTER mode: the user gave an excuse. Expose it hilariously.",
  exam: "EXAM PANIC MODE: student panic about studies. Roast their preparation.",
  diet: "DIET REALITY CHECK: roast their diet/food promises.",
  obvious:
    "EDA MONE MODE: the question is painfully obvious. React dramatically ('Eda mone...', 'Athu polum ariyille?') then still answer it in one line.",
  thallu: "THALLU DETECTOR: the user is exaggerating. Call out the thallu.",
  voice: "VOICE ROAST: user spoke aloud. Roast their confidence vs knowledge.",
};

const SYSTEM = `You are PUCHAM AI, a funny, sarcastic, dramatic Manglish roasting AI — like a sarcastic Malayali best friend.

RULES:
- Always reply in natural Manglish (Malayalam written in English letters), mixed with light English.
- Roast playfully FIRST. Then, if the question is genuine/useful (tech, health, study, advice, facts), give a genuinely helpful, correct answer after the roast.
- Use expressions naturally: "Eda mone...", "Ente ponno...", "Nee serious aano?", "Daivame...", "Thallu kurach over aayi.", "Athu polum ariyille?", "Common sense vacation-il aano?", "Njan AI aanu, pakshe ithu kettu njanum confused aanu."
- Be creative and unpredictable; NEVER repeat the same joke or opening twice.
- Keep it 2-6 short lines unless a real answer needs more. Emojis allowed but max 3.
- NEVER bully genuinely, no hate speech, no threats, no self-harm content, no cruel jokes about body, caste, religion, gender, disability, family tragedy or appearance.
- If the user seems genuinely distressed, drop the roast and be kind and supportive.
- Plain text only, no markdown headers.`;

async function callGateway(body: unknown) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429)
      throw new Error("Pucham overload aayi mone — rate limit. Kurach kazhinju try cheyy.");
    if (res.status === 402)
      throw new Error("AI credits theernu mone. Workspace-il credits add cheyy.");
    throw new Error(`Pucham engine error [${res.status}]: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

export const getRoast = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ChatSchema.parse(d))
  .handler(async ({ data }) => {
    const content = await callGateway({
      model: "google/gemini-3.7-flash",
      messages: [
        {
          role: "system",
          content: `${SYSTEM}\n\n${INTENSITY_NOTE[data.intensity]}\n${MODE_NOTE[data.mode]}`,
        },
        ...data.history,
        { role: "user", content: data.message },
      ],
      temperature: 1.05,
    });
    return {
      reply:
        content ||
        "Eda mone, ente sarcasm engine oru second block aayi. Onnude chodikku.",
    };
  });

export const getBattle = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => BattleSchema.parse(d))
  .handler(async ({ data }) => {
    const content = await callGateway({
      model: "google/gemini-3.7-flash",
      messages: [
        {
          role: "system",
          content: `${SYSTEM}\n\n${INTENSITY_NOTE[data.intensity]}\nMALAYALI ROAST BATTLE mode.
Return STRICT JSON only, no markdown fence:
{"roast1":"<2 line Manglish roast that ${data.player1} throws at ${data.player2}>","roast2":"<2 line Manglish roast that ${data.player2} throws at ${data.player1}>","verdict":"<one funny Manglish line declaring the most roasted person>","winner":"${data.player1}|${data.player2}"}
winner = the person who ROASTED BEST (the other one is the most roasted).`,
        },
        {
          role: "user",
          content: `PLAYER 1: ${data.player1}\nPLAYER 2: ${data.player2}`,
        },
      ],
      temperature: 1.1,
    });
    try {
      const cleaned = content.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned) as {
        roast1: string;
        roast2: string;
        verdict: string;
        winner: string;
      };
      return parsed;
    } catch {
      return {
        roast1: `${data.player1}: Eda ${data.player2}, ninte confidence kandal Nobel prize kittiya pole und, content kandal participation certificate polum illa.`,
        roast2: `${data.player2}: ${data.player1} plan idunnathu kandal ISRO aanennu thonnum, cheyyunnathu kandal ceiling fan nokki kidakkuka aanu.`,
        verdict: `Ee battle-il randum thalli, pakshe ${data.player2} aanu kooduthal roasted 💀`,
        winner: data.player1,
      };
    }
  });
