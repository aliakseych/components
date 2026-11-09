import { LiveOrb } from "../index";

const orbs = [
  { variant: "dark", state: "idle", caption: "Idle" },
  { variant: "light", state: "idle", caption: "Resting" },
  { variant: "tone", tone: "var(--chart-5)", state: "listening", caption: "Listening" },
  { variant: "tone", tone: "var(--chart-4)", state: "thinking", caption: "Thinking" },
] as const;

// The stage is the demo's job. The orb only draws itself and its own glow.
export default function Demo() {
  return (
    <div className="grid w-full grid-cols-2 place-items-center gap-x-6 gap-y-10 rounded-xl bg-linear-to-b from-neutral-800 to-neutral-950 px-6 py-12 sm:grid-cols-4">
      {orbs.map((orb) => (
        <div key={orb.caption} className="flex flex-col items-center gap-4">
          <LiveOrb {...orb} size={120} />
          <span className="text-xs text-neutral-300">{orb.caption}</span>
        </div>
      ))}
    </div>
  );
}
