import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getRoast } from "@/lib/pucham.functions";
import {
  ACHIEVEMENTS,
  ANALYSIS_STEPS,
  MODE_LABEL,
  RANDOM_REACTIONS,
  buildReport,
  detectMode,
  playSound,
  speak,
  type PuchamMode,
  type PuchamReport,
} from "@/lib/pucham-core";
import { MeterBar } from "./MeterBar";
import { AnalysisOverlay } from "./AnalysisOverlay";
import { RoastBattle } from "./RoastBattle";
import { SettingsPanel, type Settings } from "./SettingsPanel";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode: PuchamMode;
  report?: PuchamReport;
  reaction?: string | undefined;
};

const DEFAULT_SETTINGS: Settings = {
  intensity: "full",
  sound: true,
  voice: false,
  animation: "full",
};

const MODES: { id: PuchamMode; label: string }[] = [
  { id: "chat", label: "🤖 Ask Anything" },
  { id: "excuse", label: "🤡 Excuse Roaster" },
  { id: "exam", label: "📚 Exam Panic" },
  { id: "diet", label: "🍔 Diet Reality" },
  { id: "thallu", label: "🧠 Thallu Detector" },
];

const uid = () => Math.random().toString(36).slice(2);

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export function ChatPanel() {
  const roast = useServerFn(getRoast);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<PuchamMode>("chat");
  const [busy, setBusy] = useState(false);
  const [busyMode, setBusyMode] = useState<PuchamMode>("chat");
  const [alert, setAlert] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [popup, setPopup] = useState<(typeof ACHIEVEMENTS)[number] | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const counters = useRef<Record<string, number>>({});
  const endRef = useRef<HTMLDivElement>(null);

  /* persistence */
  useEffect(() => {
    try {
      const s = localStorage.getItem("pucham:settings");
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(s) });
      const a = localStorage.getItem("pucham:achievements");
      if (a) setUnlocked(JSON.parse(a));
      const c = localStorage.getItem("pucham:counters");
      if (c) counters.current = JSON.parse(c);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("pucham:settings", JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const unlock = useCallback(
    (id: string) => {
      setUnlocked((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        localStorage.setItem("pucham:achievements", JSON.stringify(next));
        const ach = ACHIEVEMENTS.find((a) => a.id === id);
        if (ach) {
          setPopup(ach);
          playSound("achievement", settings.sound);
          setTimeout(() => setPopup(null), 4200);
        }
        return next;
      });
    },
    [settings.sound],
  );

  const bump = useCallback((key: string) => {
    const c = counters.current;
    c[key] = (c[key] ?? 0) + 1;
    localStorage.setItem("pucham:counters", JSON.stringify(c));
    return c[key];
  }, []);

  const checkAchievements = useCallback(
    (text: string, detected: PuchamMode, report: PuchamReport) => {
      const t = text.toLowerCase();
      if (/nale|tomorrow|innu thudang|start cheyyum/.test(t) && bump("nale") >= 3)
        unlock("nale-thudangam");
      if (detected === "exam") unlock("last-minute-legend");
      if (/bus|traffic|late/.test(t) && bump("bus") >= 2) unlock("bus-late");
      if (/chaya|tea|kaapi/.test(t)) unlock("chaya-expert");
      if (report.thallu >= 92 || detected === "thallu") unlock("thallu-king");
      if (detected === "obvious") unlock("eda-mone-moment");
      if (/mood illa|mood ill/.test(t) && bump("mood") >= 2) unlock("mood-varatte");
      if (/diet/.test(t) && bump("diet") >= 3) unlock("diet-restart-champion");
      if (settings.intensity === "nuclear" && bump("nuclear") >= 3)
        unlock("nuclear-survivor");
    },
    [bump, unlock, settings.intensity],
  );

  const send = useCallback(
    async (raw: string, forced?: PuchamMode) => {
      const text = raw.trim();
      if (!text || busy) return;
      const detected = detectMode(text, forced ?? (mode === "chat" ? undefined : mode));
      const report = buildReport(text, detected);
      setError(null);
      setInput("");
      setBusyMode(detected);
      setBusy(true);
      playSound("send", settings.sound);
      if (detected === "obvious") {
        setAlert(true);
        playSound("alert", settings.sound);
        setTimeout(() => setAlert(false), 2600);
      } else if (detected === "thallu") {
        playSound("thallu", settings.sound);
      }

      setMessages((m) => [
        ...m,
        { id: uid(), role: "user", content: text, mode: detected },
      ]);

      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const res = (await roast({
          data: {
            message: text,
            mode: detected,
            intensity: settings.intensity,
            history,
          },
        })) as { reply: string };
        playSound("roast", settings.sound);
        setMessages((m) => [
          ...m,
          {
            id: uid(),
            role: "assistant",
            content: res.reply,
            mode: detected,
            report,
            reaction:
              Math.random() < 0.45
                ? RANDOM_REACTIONS[Math.floor(Math.random() * RANDOM_REACTIONS.length)]
                : undefined,
          },
        ]);
        speak(res.reply, settings.voice);
        checkAchievements(text, detected, report);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Pucham engine crash aayi mone.");
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, mode, roast, settings, checkAchievements],
  );

  const startVoice = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setError("Voice roast ee browser-il support illa mone. Type cheythoolu.");
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      void send(transcript, "voice");
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    playSound("glitch", settings.sound);
    rec.start();
  };

  const animClass = useMemo(
    () =>
      settings.animation === "off"
        ? "anim-off"
        : settings.animation === "low"
          ? "anim-low"
          : "",
    [settings.animation],
  );

  return (
    <div className={`${animClass} relative min-h-screen`}>
      {alert && (
        <div className="anim-alert-flash pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <div className="anim-glitch rounded-lg border-2 border-destructive bg-background/85 px-6 py-5 text-center font-mono">
            <p className="font-display text-xl font-black text-destructive neon-text">
              🚨 EDA MONE ALERT 🚨
            </p>
            <p className="mt-2 text-xs text-foreground">
              EXTREME LEVEL QUESTION DETECTED
            </p>
            <p className="mt-2 text-xs text-accent">
              ☑ COMMON SENSE
              <br />☑ AMMAVAN
              <br />☑ NEIGHBOUR CHETTAN
            </p>
            <p className="mt-2 text-xs text-destructive">
              COMMON SENSE: NOT RESPONDING 💀
            </p>
          </div>
        </div>
      )}

      {popup && (
        <div className="anim-trophy fixed left-1/2 top-6 z-50 w-[min(92vw,26rem)] -translate-x-1/2 rounded-lg border border-highlight bg-background/95 p-4 text-center shadow-lg">
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground">
            🏆 ACHIEVEMENT UNLOCKED
          </p>
          <p className="font-display text-lg font-black uppercase text-highlight neon-text-soft">
            {popup.emoji} {popup.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{popup.description}</p>
        </div>
      )}

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          unlocked={unlocked}
          onClearChat={() => {
            setMessages([]);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-3 pb-4 pt-4 sm:px-5">
        <header className="glass-panel scanlines flex items-center justify-between rounded-xl px-4 py-3">
          <div>
            <h1 className="font-display text-lg font-black uppercase tracking-widest text-primary neon-text">
              🤖 Pucham AI 🔥
            </h1>
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
              {MODE_LABEL[mode]} · {settings.intensity.toUpperCase()} PUCHAM ·{" "}
              {unlocked.length}/{ACHIEVEMENTS.length} 🏆
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBattle((v) => !v)}
              className="rounded border border-accent/60 px-2 py-1 font-mono text-xs text-accent hover:bg-accent/10"
            >
              ⚔️
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="rounded border border-border px-2 py-1 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              ⚙️
            </button>
          </div>
        </header>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${
                mode === m.id
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {showBattle && (
          <div className="mt-3">
            <RoastBattle
              intensity={settings.intensity}
              sound={settings.sound}
              onBattleDone={() => unlock("roast-battle-referee")}
            />
          </div>
        )}

        <div className="mt-3 flex-1 space-y-3">
          {messages.length === 0 && !busy && (
            <div className="glass-panel rounded-xl p-4 font-mono text-xs text-muted-foreground">
              <p className="text-accent">&gt; PUCHAM AI ONLINE 🔥</p>
              <p className="mt-2">
                Chodikku mone. Excuse, exam panic, diet promise, thallu — ellam
                welcome. Serious question chodichal roast kazhinju real answer-um
                tharum.
              </p>
            </div>
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="anim-rise flex justify-end">
                <div className="max-w-[85%] rounded-xl rounded-br-sm border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={m.id} className="anim-rise space-y-2">
                <div className="glass-panel max-w-[92%] rounded-xl rounded-bl-sm px-4 py-3">
                  <p className="font-mono text-[10px] tracking-widest text-primary">
                    {MODE_LABEL[m.mode]}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                    {m.content}
                  </p>
                  {m.reaction && (
                    <p className="mt-2 font-mono text-[11px] text-highlight">
                      {m.reaction}
                    </p>
                  )}
                </div>
                {m.report && (
                  <div className="glass-panel max-w-[92%] space-y-1 rounded-xl p-3">
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
                      📊 PUCHAM REPORT
                    </p>
                    <MeterBar label="THALLU LEVEL" value={m.report.thallu} />
                    <MeterBar
                      label="COMMON SENSE"
                      value={m.report.commonSense}
                      tone="accent"
                    />
                    <MeterBar
                      label="CONFIDENCE"
                      value={m.report.confidence}
                      tone="highlight"
                    />
                    <MeterBar label="QUESTION QUALITY" value={m.report.questionQuality} />
                    <MeterBar
                      label="ROAST DAMAGE"
                      value={m.report.roastDamage}
                      suffix="☢️ 999%"
                    />
                    <MeterBar
                      label="SURVIVAL CHANCE"
                      value={m.report.survival}
                      tone="accent"
                    />
                  </div>
                )}
              </div>
            ),
          )}

          {busy && (
            <AnalysisOverlay
              steps={ANALYSIS_STEPS[busyMode]}
              danger={busyMode === "obvious"}
            />
          )}
          {error && (
            <p className="font-mono text-xs text-destructive">⚠️ {error}</p>
          )}
          <div ref={endRef} />
        </div>

        <div className="glass-panel sticky bottom-2 mt-3 rounded-xl p-2">
          <div className="flex items-end gap-2">
            <button
              onClick={startVoice}
              disabled={busy}
              className={`rounded-md border px-3 py-2 text-sm ${
                listening
                  ? "anim-pulse-glow border-primary text-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
              aria-label="Voice roast"
            >
              🎤
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder="Chodikku mone... entha ithra emergency?"
              className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => void send(input)}
              disabled={busy || !input.trim()}
              className="rounded-md border border-primary bg-primary/15 px-3 py-2 font-display text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/25 disabled:opacity-40"
            >
              🔥 Roast me
            </button>
          </div>
        </div>
        <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">
          Playful roasting only 💀 · Sound {settings.sound ? "ON" : "OFF"} · Voice{" "}
          {settings.voice ? "ON" : "OFF"}
        </p>
      </div>
    </div>
  );
}
