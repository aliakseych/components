import { CallChip } from "../index";

const theme = {
  size: 30,
  radius: 9,
  surfaceColor: "var(--muted)",
  color: "var(--foreground)",
  progressColor: "var(--chart-2)",
  progressOpacity: 0.16,
  doneColor: "var(--color-emerald-600)",
  errorColor: "var(--destructive)",
  washOpacity: 0.12,
  showTimer: false,
} as const;

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <CallChip {...theme} icon="search" name="Search" argument="cotton exports" status="running" />
      <CallChip {...theme} icon="search" name="Search" argument="48 results" status="done" />
      <CallChip {...theme} icon="terminal" name="Query" argument="Timed out" status="error" />
    </div>
  );
}
