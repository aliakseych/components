import { GooeyLoader } from "../index";

export default function Demo() {
  return (
    <div className="flex min-h-screen w-full flex-wrap items-center justify-center gap-10 bg-background p-4 text-foreground sm:p-8">
      <div className="flex flex-col items-center gap-3">
        <GooeyLoader size={20} color="var(--chart-1)" label="Syncing" />
        <span className="text-xs text-muted-foreground">Syncing</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <GooeyLoader size={32} gap={6} color="var(--chart-2)" label="Saving" />
        <span className="text-xs text-muted-foreground">Saving</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <GooeyLoader size={12} gap={3} color="var(--chart-4)" speed={1} label="Uploading" />
        <span className="text-xs text-muted-foreground">Uploading</span>
      </div>
    </div>
  );
}
