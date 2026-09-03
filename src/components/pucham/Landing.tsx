import { useEffect, useState } from "react";
import { bar } from "@/lib/pucham-core";

const BOOT = [
  "INITIALIZING PUCHAM AI...",
  "LOADING SARCASM ENGINE... " + bar(100) + " 100%",
  "DETECTING USER IQ... ERROR 💀",
  "ACTIVATING MALAYALI MODE...",
  "EDA MONE PROTOCOL ENABLED 🔥",
];

export function Landing({ onEnter }: { onEnter: () => void }) {
  const [booting, setBooting] = useState(false);
  const [line, setLine] = useState(0);

  useEffect(() => {
    if (!booting) return;
    if (line >= BOOT.length) {
      const t = setTimeout(onEnter, 650);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLine((l) => l + 1), 620);
    return () => clearTimeout(t);
  }, [booting, line, onEnter]);

  if (booting) {
    return (
      <div className="scanlines flex min-h-screen items-center justify-center px-4">
        <div className="glass-panel w-full max-w-xl rounded-xl p-6 font-mono text-sm">
          {BOOT.slice(0, line).map((b) => (
            <p key={b} className="anim-rise text-accent">
              <span className="text-muted-foreground">$ </span>
              {b}
            </p>
          ))}
          <p className="anim-glitch text-primary">▋</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scanlines flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-mono text-xs tracking-[0.4em] text-muted-foreground">
        SYSTEM v3.0 · KERALA EDITION
      </p>
      <h1 className="anim-flicker mt-4 font-display text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">
        <span className="neon-text text-primary">🤖 PUCHAM AI 🔥</span>
      </h1>
      <p className="mt-4 max-w-2xl font-display text-base uppercase tracking-widest text-foreground sm:text-xl">
        Chodikku mone...
        <br />
        <span className="text-accent">judge cheyyan njangal ready aanu.</span>
      </p>

      <div className="glass-panel mt-8 w-full max-w-md rounded-xl p-4 text-left font-mono text-xs sm:text-sm">
        {[
          ["SARCASM ENGINE", "ONLINE 🔥"],
          ["THALLU DETECTOR", "ACTIVE 🧠"],
          ["COMMON SENSE CHECKER", "READY 💀"],
          ["PUCHAM LEVEL", "MAXIMUM ☢️"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-0.5">
            <span className="text-muted-foreground">{k}:</span>
            <span className="text-accent neon-text-soft">{v}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setBooting(true)}
        className="anim-pulse-glow mt-10 rounded-lg border border-primary bg-primary/15 px-8 py-4 font-display text-lg font-bold uppercase tracking-widest text-primary transition-transform hover:scale-105 hover:bg-primary/25"
      >
        🔥 Start Getting Roasted
      </button>

      <p className="mt-6 max-w-md text-xs text-muted-foreground">
        Ellam വെറും തമാശ — playful roasting only. Feelings hurt aayal athu ninte
        problem alla, ente algorithm-inte aanu. 😂
      </p>
    </div>
  );
}
