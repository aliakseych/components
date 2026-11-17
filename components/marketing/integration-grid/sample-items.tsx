import type { ReactNode } from "react";

const hues = [262, 200, 330, 215, 150, 28, 355, 175, 95, 245, 12, 290];
let n = 0;
const svg = (children: ReactNode) => {
  const h = hues[n++ % hues.length];
  return (
    <span style={{ background: `linear-gradient(145deg, oklch(0.7 0.19 ${h}), oklch(0.5 0.2 ${h + 30}))`, color: "white", display: "grid", placeItems: "center", width: "100%", height: "100%" }}>
      <svg style={{ width: 200, height: 200 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </span>
  );
};

export const sampleItems = [
  { name: "Ledger", icon: svg(<><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 9h8M8 12h8M8 15h5" /></>) },
  { name: "Dispatch", icon: svg(<><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17" r="1.6" /><circle cx="17" cy="17" r="1.6" /></>) },
  { name: "Mailroom", icon: svg(<><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 8 8 6 8-6" /></>) },
  { name: "Calendar", icon: svg(<><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></>) },
  { name: "Payments", icon: svg(<><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M3 10h18M7 15h3" /></>) },
  { name: "Telemetry", icon: svg(<path d="M3 13h4l3-7 4 12 3-5h4" />) },
  { name: "Documents", icon: svg(<><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></>) },
  { name: "Insights", icon: svg(<><path d="M4 20V10M10 20V4M16 20v-7M21 20H3" /></>) },
  { name: "Directory", icon: svg(<><circle cx="12" cy="9" r="3.5" /><path d="M5 20c1-4 4-5.5 7-5.5s6 1.5 7 5.5" /></>) },
  { name: "Safety", icon: svg(<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6zM9 12l2 2 4-4" />) },
  { name: "Fuel", icon: svg(<><path d="M5 20V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15M4 20h11M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3" /></>) },
  { name: "Chat", icon: svg(<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />) },
];
