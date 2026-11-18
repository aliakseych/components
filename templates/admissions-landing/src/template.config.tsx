// Everything product-specific lives here and in src/sample/. Swap for your own.

export const config = {
  /** Wordmark text used in the header, dashboard mock and legal line. */
  brandName: "Quill",
  /** Header call to action and sign-in link. */
  cta: { label: "Start for free", href: "#start" },
  login: { label: "Log in", href: "#login" },
  legal: "© 2026 Quill, Inc.",
};

/** Text wordmark standing in for a logo; 120x40 like the reference header slot. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className} style={{ fontFamily: "var(--font-serif)" }}>
      <span className="text-[1.75rem] leading-10 font-semibold tracking-tight">{config.brandName}</span>
    </span>
  );
}
