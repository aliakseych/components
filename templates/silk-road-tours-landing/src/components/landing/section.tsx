// Full-bleed tone block. `edge` is drawn at the TOP in this section's own colour, overlapping the section above.
// Tone roles live in index.css ([data-tone]).
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "sun" | "paper" | "cream" | "ink";
export type Edge = "arch" | "band" | "none";

/** arch: whole pointed arches in the section's colour; band: the woven ikat ribbon tiled left to right. */
export function Divider({ kind }: { kind: Exclude<Edge, "none"> }) {
  if (kind === "band") return <div className="edge-band" aria-hidden="true" />;
  return (
    <>
      <div className="edge-arch" aria-hidden="true" />
      {/* Solid strip under the valleys: rounded mask tiles leave hairline seams where they meet. */}
      <div className="edge-arch-base" aria-hidden="true" />
    </>
  );
}

type Props = {
  tone?: Tone;
  edge?: Edge;
  id?: string;
  labelledby?: string;
  className?: string;
  style?: CSSProperties;
  as?: "section" | "footer";
  children: ReactNode;
};

export function Section({ tone = "sun", edge = "none", id, labelledby, className, style, as: Tag = "section", children }: Props) {
  return (
    <Tag id={id} aria-labelledby={labelledby} data-tone={tone} className={cn("section-pad relative", className)} style={style}>
      {edge !== "none" && <Divider kind={edge} />}
      <div className="container-site">{children}</div>
    </Tag>
  );
}
