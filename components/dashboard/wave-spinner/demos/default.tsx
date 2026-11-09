import { WaveSpinner } from "../index";

export default function Demo() {
  return (
    <div className="grid w-full grid-cols-1 gap-8 text-foreground sm:grid-cols-3">
      <div className="flex flex-col items-center gap-3">
        <WaveSpinner
          pattern="diagonal"
          size={14}
          colors={["var(--chart-4)", "var(--chart-2)"]}
          label="Loading diagonal"
        />
        <span className="text-xs text-muted-foreground">Diagonal 4 by 4</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <WaveSpinner
          pattern="center"
          rows={3}
          cols={3}
          size={14}
          colors={["var(--chart-3)", "var(--chart-1)"]}
          label="Loading centre"
        />
        <span className="text-xs text-muted-foreground">Centre 3 by 3</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <WaveSpinner
          pattern="plus"
          size={14}
          colors={["var(--chart-5)", "var(--chart-1)"]}
          label="Loading plus"
        />
        <span className="text-xs text-muted-foreground">Plus</span>
      </div>
    </div>
  );
}
