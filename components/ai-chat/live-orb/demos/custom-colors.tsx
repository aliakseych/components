import { LiveOrb } from "../index";

const orbs = [
  { colors: { body: "#f9a8d4", shade: "#be185d", eye: "#500724", glow: "#f472b6" }, state: "listening", caption: "Rose" },
  { colors: { body: "#a5f3fc", shade: "#0e7490", eye: "#083344", glow: "#22d3ee" }, state: "thinking", caption: "Cyan" },
  { colors: { body: "var(--primary)", shade: "var(--primary)", eye: "var(--primary-foreground)", glow: "var(--primary)" }, state: "idle", caption: "Theme" },
] as const;

export default function Demo() {
  return (
    <div className="grid w-full grid-cols-3 place-items-center gap-6 rounded-xl bg-linear-to-b from-neutral-800 to-neutral-950 px-6 py-12">
      {orbs.map((orb) => (
        <div key={orb.caption} className="flex flex-col items-center gap-4">
          <LiveOrb colors={orb.colors} state={orb.state} size={120} />
          <span className="text-xs text-neutral-300">{orb.caption}</span>
        </div>
      ))}
    </div>
  );
}
