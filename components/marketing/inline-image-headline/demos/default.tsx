import type { ReactNode } from "react";
import { InlineImageHeadline } from "../index";

const Tile = ({ children, className }: { children: ReactNode; className: string }) => (
  <svg viewBox="0 0 48 48" className={`size-full rounded-full ${className}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const mail = (
  <Tile className="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
    <rect x="12" y="15" width="24" height="18" rx="3" />
    <path d="m13 18 11 8 11-8" />
  </Tile>
);
const brief = (
  <Tile className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
    <rect x="14" y="12" width="20" height="24" rx="3" />
    <path d="M19 20h10M19 26h10M19 31h5" />
  </Tile>
);
const bot = (
  <Tile className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
    <rect x="13" y="17" width="22" height="17" rx="5" />
    <path d="M24 12v5M20 25v2M28 25v2" />
  </Tile>
);
const alert = (
  <Tile className="bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300">
    <path d="M24 13 36 34H12z" />
    <path d="M24 21v6M24 30.5v.01" />
  </Tile>
);

const Pin = ({ children, bg, fg }: { children: ReactNode; bg: string; fg: string }) => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={fg}>
    <rect x="2" y="2" width="40" height="40" rx="12" fill="currentColor" fillOpacity=".14" stroke="none" className={bg} />
    {children}
  </svg>
);

const pills = [
  { label: "Locations", image: <Pin bg="" fg="text-sky-600 dark:text-sky-300"><path d="M22 34s8-7 8-14a8 8 0 1 0-16 0c0 7 8 14 8 14Z" /><circle cx="22" cy="20" r="3" /></Pin> },
  { label: "Alerts", image: <Pin bg="" fg="text-red-500 dark:text-red-300"><path d="M22 11 34 32H10z" /><path d="M22 19v6M22 28.5v.01" /></Pin> },
  { label: "Repairs", image: <Pin bg="" fg="text-amber-600 dark:text-amber-300"><path d="M28 12a6 6 0 0 0-5 8l-10 10a2.5 2.5 0 0 0 4 4l10-10a6 6 0 0 0 8-5l-4 3-3-3 3-4Z" /></Pin> },
  { label: "Money", image: <Pin bg="" fg="text-emerald-600 dark:text-emerald-300"><circle cx="22" cy="22" r="11" /><path d="M25.5 18a4 3 0 0 0-3.5-1.5c-2 0-3.500 1-3.500 2.500s1.500 2 3.500 2.500 3.500 1 3.500 2.500-1.500 2.500-3.500 2.500a4 3 0 0 1-3.500-1.500M22 14v2.500M22 28v2.500" /></Pin> },
  { label: "Fleet", image: <Pin bg="" fg="text-violet-600 dark:text-violet-300"><path d="M9 29V16h16v13M25 20h6l4 5v4H9" /><circle cx="16" cy="30" r="2.500" /><circle cx="29" cy="30" r="2.500" /></Pin> },
  { label: "Fuel", image: <Pin bg="" fg="text-orange-600 dark:text-orange-300"><path d="M14 33V13h12v20M12 33h16M26 19h3a2 2 0 0 1 2 2v8a2 2 0 0 0 3 0V19l-3-3M17 18h6" /></Pin> },
];

export default function Demo() {
  return (
    <InlineImageHeadline
      pills={pills}
      segments={[
        { text: "Atlas connects your" },
        { visuals: [mail, brief, bot], text: "systems," },
        { text: "mailboxes and channels, highlights what" },
        { visuals: [alert], text: "needs" },
        { text: "a look, and drafts your next step." },
      ]}
    />
  );
}
