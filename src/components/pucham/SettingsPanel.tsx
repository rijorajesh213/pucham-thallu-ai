import type { RoastIntensity } from "@/lib/pucham-core";
import { ACHIEVEMENTS } from "@/lib/pucham-core";

export type Settings = {
  intensity: RoastIntensity;
  sound: boolean;
  voice: boolean;
  animation: "off" | "low" | "full";
};

const INTENSITIES: { id: RoastIntensity; label: string }[] = [
  { id: "soft", label: "🌱 Soft Pucham" },
  { id: "full", label: "🔥 Full Pucham" },
  { id: "nuclear", label: "☢️ Nuclear Pucham" },
];

export function SettingsPanel({
  settings,
  onChange,
  unlocked,
  onClearChat,
  onClose,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  unlocked: string[];
  onClearChat: () => void;
  onClose: () => void;
}) {
  const Toggle = ({
    label,
    value,
    onToggle,
  }: {
    label: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs hover:border-primary/60"
    >
      <span className="text-muted-foreground">{label}</span>
      <span className={value ? "text-accent" : "text-muted-foreground"}>
        {value ? "ON" : "OFF"}
      </span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
      <div className="glass-panel scanlines anim-rise h-full w-full max-w-sm overflow-y-auto p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold uppercase tracking-widest text-primary neon-text">
            ⚙️ Settings
          </h2>
          <button
            onClick={onClose}
            className="rounded border border-border px-2 py-1 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary"
          >
            CLOSE
          </button>
        </div>

        <p className="mt-5 font-mono text-[11px] tracking-widest text-muted-foreground">
          ROAST INTENSITY
        </p>
        <div className="mt-2 space-y-2">
          {INTENSITIES.map((i) => (
            <button
              key={i.id}
              onClick={() => onChange({ ...settings, intensity: i.id })}
              className={`w-full rounded-md border px-3 py-2 text-left font-display text-sm uppercase tracking-wider transition-colors ${
                settings.intensity === i.id
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border bg-muted/20 text-muted-foreground hover:border-primary/50"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>

        <p className="mt-6 font-mono text-[11px] tracking-widest text-muted-foreground">
          SYSTEM
        </p>
        <div className="mt-2 space-y-2">
          <Toggle
            label="🔊 SOUND EFFECTS"
            value={settings.sound}
            onToggle={() => onChange({ ...settings, sound: !settings.sound })}
          />
          <Toggle
            label="🗣️ VOICE RESPONSE"
            value={settings.voice}
            onToggle={() => onChange({ ...settings, voice: !settings.voice })}
          />
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
            <span className="text-muted-foreground">🎞️ ANIMATION INTENSITY</span>
            <div className="mt-2 flex gap-2">
              {(["off", "low", "full"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => onChange({ ...settings, animation: a })}
                  className={`flex-1 rounded border px-2 py-1 uppercase ${
                    settings.animation === a
                      ? "border-accent text-accent"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground">
            🌑 DARK MODE: <span className="text-accent">PERMANENT</span> (Pucham
            light-il varilla)
          </div>
          <button
            onClick={onClearChat}
            className="w-full rounded-md border border-destructive/60 bg-destructive/10 px-3 py-2 font-mono text-xs uppercase tracking-widest text-destructive hover:bg-destructive/20"
          >
            🗑️ Clear chat
          </button>
        </div>

        <p className="mt-6 font-mono text-[11px] tracking-widest text-muted-foreground">
          ACHIEVEMENT HISTORY ({unlocked.length}/{ACHIEVEMENTS.length})
        </p>
        <div className="mt-2 space-y-2 pb-8">
          {ACHIEVEMENTS.map((a) => {
            const got = unlocked.includes(a.id);
            return (
              <div
                key={a.id}
                className={`rounded-md border px-3 py-2 text-xs ${
                  got
                    ? "border-highlight/60 bg-highlight/10 text-foreground"
                    : "border-border bg-muted/20 text-muted-foreground"
                }`}
              >
                <p className="font-display uppercase tracking-wider">
                  {got ? a.emoji : "🔒"} {a.title}
                </p>
                <p className="mt-0.5 opacity-80">{got ? a.description : "LOCKED"}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
