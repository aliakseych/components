import Link from "next/link";
import { CATEGORY_ICON, CATEGORY_TONE, pct } from "@/lib/format";
import type { DealSummary } from "@/lib/types";
import { Sparkline } from "@/components/viz/sparkline";

export function TickerStrip({ deals }: { deals: DealSummary[] }) {
  if (!deals.length) return null;
  return (
    <div className="ticker-viewport fade-x -mx-4 overflow-hidden">
      <style>{`
        @keyframes ticker-scroll { to { transform: translateX(-50%); } }
        .ticker-track { animation: ticker-scroll 35s linear infinite; }
        .ticker-viewport:hover .ticker-track, .ticker-viewport:active .ticker-track, .ticker-viewport:focus-within .ticker-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .ticker-viewport { overflow-x: auto; }
          .ticker-track { animation: none; }
          .ticker-copy { display: none; }
        }
      `}</style>
      <div className="ticker-track flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className={`flex shrink-0 gap-2 pr-2 ${copy ? "ticker-copy" : ""}`} aria-hidden={copy === 1}>
            {deals.map((deal) => {
              const Icon = CATEGORY_ICON[deal.category];
              const tone = CATEGORY_TONE[deal.category];
              return (
                <Link key={deal.id} href={`/deals/${deal.id}`} tabIndex={copy ? -1 : undefined} className="flex min-h-12 items-center gap-2 rounded-full bg-card py-1 pl-1 pr-3">
                  <span className={`flex size-10 items-center justify-center rounded-full ${tone.bg} ${tone.fg}`}><Icon className="size-5" /></span>
                  <span className="font-semibold">{deal.ticker}</span>
                  <span className="text-sm font-semibold tabular text-gain">{pct(deal.investor_rate, 2)}</span>
                  <span className="w-12"><Sparkline points={deal.sparkline} height={24} /></span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
