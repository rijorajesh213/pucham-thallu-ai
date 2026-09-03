import { useEffect, useState } from "react";
import { bar } from "@/lib/pucham-core";

export function AnalysisOverlay({
  steps,
  danger = false,
}: {
  steps: string[];
  danger?: boolean;
}) {
  const [shown, setShown] = useState(1);

  useEffect(() => {
    setShown(1);
    const id = setInterval(() => {
      setShown((s) => (s >= steps.length ? s : s + 1));
    }, 420);
    return () => clearInterval(id);
  }, [steps]);

  return (
    <div
      className={`glass-panel scanlines anim-rise rounded-lg p-3 font-mono text-[11px] sm:text-xs ${
        danger ? "anim-alert-flash" : ""
      }`}
    >
      {steps.slice(0, shown).map((s, i) => (
        <div key={s} className="anim-rise text-accent">
          <span className="text-muted-foreground">&gt; </span>
          {s}
          {i < shown - 1 && (
            <span className="ml-2 tracking-[0.15em] text-primary">
              {bar(Math.min(100, 30 + i * 22))}
            </span>
          )}
        </div>
      ))}
      <span className="text-primary">▋</span>
    </div>
  );
}
