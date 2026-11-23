import type { SVGProps } from "react";

type Kind = "tee" | "plaid" | "raglan" | "jeans";

/** Flat placeholder garments on a light tile; stands in for product photography. */
export function Garment({ kind, ...props }: { kind: Kind } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 130" aria-hidden {...props}>
      <rect width="100" height="130" fill="#eeeeee" />
      {kind === "tee" && <path d="M30 24l18-6c3 6 10 6 13 0l18 6 10 22-14 6v52H34V52l-14-6z" fill="#25272b" />}
      {kind === "plaid" && (
        <g>
          <path d="M30 24l18-6c3 6 10 6 13 0l18 6 10 24-14 5v55H34V53l-14-5z" fill="#5a4a7a" />
          <path d="M40 24v84M52 20v88M64 24v84M30 60h50M30 80h50" stroke="#c85a6a" strokeWidth="2" opacity="0.7" />
        </g>
      )}
      {kind === "raglan" && (
        <g>
          <path d="M30 24l18-6c3 6 10 6 13 0l18 6 10 22-14 6v52H34V52l-14-6z" fill="#e8663a" />
          <path d="M30 24l18-6c3 6 10 6 13 0l18 6 10 22-14 6-6-12-14 6-14-6-6 12-14-6z" fill="#2c2f36" />
        </g>
      )}
      {kind === "jeans" && (
        <g>
          <path d="M32 16h36l6 98H55L50 52l-5 62H26z" fill="#3a5f8f" />
          <path d="M32 16h36v10H32z" fill="#2e4d78" />
          <path d="M50 26v26" stroke="#1f3555" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
}

export function Stars({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 50 8" className={className} style={style} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={4 + i * 10} cy="4" r="3.4" fill={i < 4 ? "#f5a623" : "#d0d3d9"} />
      ))}
    </svg>
  );
}
