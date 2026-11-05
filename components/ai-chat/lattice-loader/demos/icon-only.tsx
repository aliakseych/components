import { LatticeLoader } from "../index";

export default function Demo() {
  return (
    <LatticeLoader
      label=""
      doneLabel=""
      errorLabel=""
      showTimer={false}
      cellSize={4}
      gap={2}
      color="var(--chart-2)"
      glow
      glowColor="color-mix(in oklch, var(--chart-2) 55%, transparent)"
    />
  );
}
