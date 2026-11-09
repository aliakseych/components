import { FlowPanel, type FlowTexture } from "../index";

const textures: FlowTexture[] = ["waves", "grain", "mesh"];

export default function Demo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {textures.map((texture) => (
        <figure key={texture} className="flex flex-col gap-2">
          <FlowPanel texture={texture} className="h-40 rounded-xl border" />
          <figcaption className="font-mono text-xs text-muted-foreground">{texture}</figcaption>
        </figure>
      ))}
    </div>
  );
}
