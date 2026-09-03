import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getBattle } from "@/lib/pucham.functions";
import { MeterBar } from "./MeterBar";
import { AnalysisOverlay } from "./AnalysisOverlay";
import type { RoastIntensity } from "@/lib/pucham-core";
import { playSound } from "@/lib/pucham-core";

type Result = {
  roast1: string;
  roast2: string;
  verdict: string;
  winner: string;
};

export function RoastBattle({
  intensity,
  sound,
  onBattleDone,
}: {
  intensity: RoastIntensity;
  sound: boolean;
  onBattleDone: () => void;
}) {
  const battle = useServerFn(getBattle);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [damage, setDamage] = useState<[number, number]>([0, 0]);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (!p1.trim() || !p2.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    playSound("battle", sound);
    try {
      const r = (await battle({
        data: { player1: p1.trim(), player2: p2.trim(), intensity },
      })) as Result;
      const d1 = 45 + Math.round(Math.random() * 40);
      const d2 = 60 + Math.round(Math.random() * 40);
      setDamage(r.winner === p1.trim() ? [d1, d2] : [d2, d1]);
      setResult(r);
      playSound("roast", sound);
      onBattleDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Battle failed mone.");
    } finally {
      setLoading(false);
    }
  };

  const mostRoasted = result
    ? result.winner === p1.trim()
      ? p2.trim()
      : p1.trim()
    : "";

  return (
    <div className="glass-panel scanlines rounded-xl p-4">
      <h3 className="font-display text-base font-bold uppercase tracking-widest text-primary neon-text">
        ⚔️ Malayali Roast Battle
      </h3>
      <div className="mt-3 grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
        <input
          value={p1}
          onChange={(e) => setP1(e.target.value)}
          placeholder="PLAYER 1 name"
          maxLength={40}
          className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-sm outline-none focus:border-primary"
        />
        <span className="text-center font-display text-sm text-accent">VS</span>
        <input
          value={p2}
          onChange={(e) => setP2(e.target.value)}
          placeholder="PLAYER 2 name"
          maxLength={40}
          className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-sm outline-none focus:border-primary"
        />
      </div>
      <button
        onClick={start}
        disabled={loading || !p1.trim() || !p2.trim()}
        className="mt-3 w-full rounded-md border border-primary bg-primary/15 px-4 py-2 font-display text-sm font-bold uppercase tracking-widest text-primary hover:bg-primary/25 disabled:opacity-40"
      >
        🔥 Start Roast Battle
      </button>

      {loading && (
        <div className="mt-3">
          <AnalysisOverlay
            steps={[
              "LOADING BOTH EGOS...",
              "CALCULATING ROAST DAMAGE...",
              "CONSULTING AMMAVAN...",
              "FINALIZING DESTRUCTION 💀",
            ]}
          />
        </div>
      )}

      {error && (
        <p className="mt-3 font-mono text-xs text-destructive">⚠️ {error}</p>
      )}

      {result && (
        <div className="anim-rise mt-4 space-y-3">
          <div className="rounded-md border border-accent/40 bg-accent/5 p-3">
            <p className="font-display text-xs uppercase tracking-widest text-accent">
              {p1}
            </p>
            <p className="mt-1 text-sm whitespace-pre-wrap">{result.roast1}</p>
          </div>
          <div className="rounded-md border border-primary/40 bg-primary/5 p-3">
            <p className="font-display text-xs uppercase tracking-widest text-primary">
              {p2}
            </p>
            <p className="mt-1 text-sm whitespace-pre-wrap">{result.roast2}</p>
          </div>
          <div className="space-y-1 rounded-md border border-border bg-muted/20 p-3">
            <MeterBar label={`${p1.toUpperCase()} DAMAGE`} value={damage[0]} />
            <MeterBar
              label={`${p2.toUpperCase()} DAMAGE`}
              value={damage[1]}
              tone="accent"
            />
          </div>
          <div className="anim-flicker rounded-md border border-highlight/60 bg-highlight/10 p-3 text-center">
            <p className="font-mono text-[11px] tracking-widest text-muted-foreground">
              🏆 MOST ROASTED PERSON
            </p>
            <p className="font-display text-xl font-black uppercase text-highlight neon-text-soft">
              {mostRoasted} 💀
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{result.verdict}</p>
          </div>
        </div>
      )}
    </div>
  );
}
