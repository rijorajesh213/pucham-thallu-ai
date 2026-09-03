export type RoastIntensity = "soft" | "full" | "nuclear";

export type PuchamMode =
  | "chat"
  | "excuse"
  | "exam"
  | "diet"
  | "obvious"
  | "thallu"
  | "voice";

export type PuchamReport = {
  thallu: number;
  commonSense: number;
  confidence: number;
  questionQuality: number;
  roastDamage: number;
  survival: number;
};

const EXCUSE_WORDS = [
  "bus",
  "late",
  "traffic",
  "block",
  "alarm",
  "network",
  "signal",
  "sick",
  "pani",
  "headache",
  "sorry",
  "forgot",
  "marannu",
  "excuse",
  "reach",
];
const EXAM_WORDS = [
  "exam",
  "padikk",
  "study",
  "test",
  "assignment",
  "record",
  "viva",
  "syllabus",
  "portion",
  "semester",
  "mark",
  "result",
  "tomorrow",
  "nale",
];
const DIET_WORDS = [
  "diet",
  "gym",
  "weight",
  "food",
  "biriyani",
  "biriani",
  "porotta",
  "parotta",
  "cheat day",
  "snack",
  "chaya",
  "workout",
  "fat",
  "kaloric",
  "calorie",
  "beef",
  "eat",
  "kazhikk",
];
const THALLU_WORDS = [
  "ellam ariyam",
  "njan aanu best",
  "best",
  "genius",
  "topper",
  "millionaire",
  "crore",
  "famous",
  "expert",
  "master",
  "no one can",
  "always",
  "never fail",
  "ella",
  "world",
  "champion",
  "pro",
];
const OBVIOUS_PATTERNS = [
  /umbrella.*(venamo|vend)/i,
  /(charger|charge).*(venamo|vend)/i,
  /pass aav.*(padikk|study)/i,
  /water.*(dahi|thirst)/i,
  /(mazha|rain).*(nanay|wet)/i,
  /breathe|shwasi/i,
  /2\s*\+\s*2/,
  /sleep.*(urakk|tired)/i,
  /venamo\??$/i,
  /alle\??$/i,
];

const hasAny = (text: string, words: string[]) =>
  words.some((w) => text.includes(w));

export function detectMode(raw: string, forced?: PuchamMode): PuchamMode {
  if (forced && forced !== "chat") return forced;
  const text = raw.toLowerCase();
  if (OBVIOUS_PATTERNS.some((p) => p.test(raw)) && raw.trim().length < 90)
    return "obvious";
  if (hasAny(text, EXCUSE_WORDS)) return "excuse";
  if (hasAny(text, EXAM_WORDS)) return "exam";
  if (hasAny(text, DIET_WORDS)) return "diet";
  if (hasAny(text, THALLU_WORDS)) return "thallu";
  return "chat";
}

const seededRand = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const hash = (str: string) => {
  let h = 7;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000007;
  return h;
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function buildReport(message: string, mode: PuchamMode): PuchamReport {
  const r = seededRand(hash(message) + message.length * 13 + 1);
  const text = message.toLowerCase();
  const exclam = (message.match(/[!?]/g) ?? []).length;
  const thalluBoost = hasAny(text, THALLU_WORDS) ? 45 : 0;
  const base = {
    thallu: clamp(20 + r() * 45 + thalluBoost + exclam * 5),
    commonSense: clamp(mode === "obvious" ? r() * 12 : 25 + r() * 60),
    confidence: clamp(55 + r() * 45 + exclam * 4),
    questionQuality: clamp(mode === "obvious" ? r() * 15 : 15 + r() * 70),
    roastDamage: clamp(60 + r() * 40),
    survival: 0,
  };
  base.survival = clamp(100 - (base.thallu + (100 - base.commonSense)) / 2.4);
  return base;
}

export const bar = (pct: number, size = 10) => {
  const filled = Math.round((pct / 100) * size);
  return "█".repeat(Math.min(size, filled)) + "░".repeat(Math.max(0, size - filled));
};

/* ---------------- Achievements ---------------- */

export type Achievement = {
  id: string;
  title: string;
  emoji: string;
  description: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "nale-thudangam",
    title: "NALE THUDANGAM",
    emoji: "🏆",
    description: "You have successfully delayed your responsibilities. 💀",
  },
  {
    id: "last-minute-legend",
    title: "LAST MINUTE LEGEND",
    emoji: "🏆",
    description: "Exam Panic Mode activated. Syllabus still unopened.",
  },
  {
    id: "bus-late",
    title: "BUS LATE",
    emoji: "🚌",
    description: "Same excuse, different day. KSRTC-yude brand ambassador.",
  },
  {
    id: "chaya-expert",
    title: "CHAYA EXPERT",
    emoji: "☕",
    description: "Chaya kudichu, padichilla. Consistency 100%.",
  },
  {
    id: "thallu-king",
    title: "THALLU KING 👑",
    emoji: "👑",
    description: "Thallu meter 100% adichu. Local limit exceeded.",
  },
  {
    id: "eda-mone-moment",
    title: "EDA MONE MOMENT 💀",
    emoji: "💀",
    description: "Extremely obvious question detected. Common sense not responding.",
  },
  {
    id: "mood-varatte",
    title: "MOOD VARATTE",
    emoji: "🛌",
    description: "'Enikku mood illa' x3. Mood ippozhum vannilla.",
  },
  {
    id: "diet-restart-champion",
    title: "DIET RESTART CHAMPION",
    emoji: "🍔",
    description: "Diet 3 pravashyam thudangi. Biriyani ippozhum undu.",
  },
  {
    id: "roast-battle-referee",
    title: "ROAST BATTLE REFEREE",
    emoji: "⚔️",
    description: "You made two friends fight. Proud moment.",
  },
  {
    id: "nuclear-survivor",
    title: "NUCLEAR SURVIVOR",
    emoji: "☢️",
    description: "Nuclear Pucham enabled and still typing. Respect.",
  },
];

export const RANDOM_REACTIONS = [
  '💀 "Ente ponno..."',
  '🤦 "Daivame ithu entha question..."',
  '🔥 "Roast opportunity detected."',
  '🚨 "Common sense missing."',
  '🤖 "AI confusion level increasing..."',
  '😂 "Ithokke full confidence-il parayunnathu alle best part."',
  '🧠 "Thallu kurach over aayi mone."',
  '📉 "Question quality free fall-il aanu."',
];

export const ANALYSIS_STEPS: Record<PuchamMode, string[]> = {
  chat: [
    "ANALYZING USER MESSAGE...",
    "CHECKING COMMON SENSE...",
    "DETECTING THALLU...",
    "CONFIDENCE LEVEL...",
    "GENERATING PUCHAM...",
    "ROAST READY 🔥💀",
  ],
  excuse: [
    "EXCUSE DETECTED...",
    "ORIGINALITY SCAN...",
    "BELIEVABILITY SCAN...",
    "CROSS-CHECKING WITH AMMAVAN...",
    "ROAST READY 🔥",
  ],
  exam: [
    "EXAM PANIC MODE ENGAGED...",
    "SCANNING SYLLABUS (EMPTY)...",
    "CALCULATING PANIC LEVEL...",
    "LOCATING HOPE... NOT FOUND 💀",
    "ROAST READY 🔥",
  ],
  diet: [
    "DIET REALITY CHECK...",
    "COUNTING PROMISES MADE...",
    "COUNTING PROMISES KEPT...",
    "SNACK CONSUMPTION: 999%",
    "ROAST READY 🍔",
  ],
  obvious: [
    "🚨 EDA MONE ALERT 🚨",
    "CONTACTING COMMON SENSE...",
    "CONTACTING AMMAVAN...",
    "CONTACTING NEIGHBOUR CHETTAN...",
    "COMMON SENSE: NOT RESPONDING 💀",
  ],
  thallu: [
    "ANALYZING THALLU...",
    "CALIBRATING EXAGGERATION SENSOR...",
    "LOCAL THALLU LIMIT CHECK...",
    "WARNING: LIMIT EXCEEDED 🚨",
  ],
  voice: [
    "🎤 VOICE DETECTED...",
    "EDA MONE...",
    "ANALYZING CONFIDENCE...",
    "MEASURING KNOWLEDGE...",
    "THALLU CAPACITY: 100%",
    "🔥 ROAST READY",
  ],
};

export const MODE_LABEL: Record<PuchamMode, string> = {
  chat: "🤖 PUCHAM CHAT",
  excuse: "🤡 EXCUSE ROASTER",
  exam: "📚 EXAM PANIC MODE",
  diet: "🍔 DIET REALITY CHECK",
  obvious: "🚨 EDA MONE MODE",
  thallu: "🧠 THALLU DETECTOR",
  voice: "🎤 VOICE ROAST",
};

/* ---------------- Sound ---------------- */

type SoundName =
  | "send"
  | "roast"
  | "achievement"
  | "alert"
  | "thallu"
  | "battle"
  | "glitch";

let ctx: AudioContext | null = null;

function tone(freq: number, dur: number, type: OscillatorType, delay = 0, gainVal = 0.06) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  gain.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + dur);
}

export function playSound(name: SoundName, enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  try {
    ctx ??= new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    switch (name) {
      case "send":
        tone(660, 0.08, "square");
        break;
      case "roast":
        tone(220, 0.12, "sawtooth");
        tone(440, 0.14, "sawtooth", 0.09);
        break;
      case "achievement":
        [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, "triangle", i * 0.09));
        break;
      case "alert":
        [0, 0.28, 0.56].forEach((d) => {
          tone(880, 0.22, "square", d, 0.05);
          tone(620, 0.22, "square", d + 0.12, 0.05);
        });
        break;
      case "thallu":
        tone(140, 0.35, "sawtooth", 0, 0.05);
        tone(90, 0.4, "sawtooth", 0.18, 0.05);
        break;
      case "battle":
        [392, 523, 659, 880].forEach((f, i) => tone(f, 0.2, "square", i * 0.1, 0.05));
        break;
      case "glitch":
        for (let i = 0; i < 6; i++)
          tone(200 + Math.random() * 900, 0.04, "square", i * 0.04, 0.04);
        break;
    }
  } catch {
    /* audio unsupported */
  }
}

export function speak(text: string, enabled: boolean) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ""));
    u.rate = 1.05;
    u.pitch = 0.9;
    const hi = window.speechSynthesis.getVoices().find((v) => /hi-IN|en-IN/.test(v.lang));
    if (hi) u.voice = hi;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* tts unsupported */
  }
}
