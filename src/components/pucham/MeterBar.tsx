import { bar } from "@/lib/pucham-core";

export function MeterBar({
  label,
  value,
  tone = "primary",
  suffix,
}: {
  label: string;
  value: number;
  tone?: "primary" | "accent" | "highlight";
  suffix?: string;
}) {
  const toneClass =
    tone === "accent"
      ? "text-accent"
      : tone === "highlight"
        ? "text-highlight"
        : "text-primary";
  return (
    <div className="font-mono text-[11px] leading-tight sm:text-xs">
      <div className="flex items-center justify-between gap-2 text-muted-foreground">
        <span className="tracking-widest">{label}</span>
        <span className={toneClass}>{suffix ?? `${value}%`}</span>
      </div>
      <div className={`${toneClass} neon-text-soft tracking-[0.15em]`}>{bar(value)}</div>
    </div>
  );
}
