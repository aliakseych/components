import { BentoGrid } from "../index";

export default function Demo() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 text-foreground sm:p-8">
      <BentoGrid effect="beam" />
    </div>
  );
}
