import { Check, Clock } from "lucide-react";
import { dateShort, money } from "@/lib/format";

export interface ScheduleRow {
  label: string;
  sub?: string;
  amount: string | number;
  paid_at: string | null;
}

export function ScheduleTable({ rows }: { rows: ScheduleRow[] }) {
  return (
    <div className="space-y-2" role="list">
      {rows.map((row, i) => (
        <div key={`${row.label}-${i}`} role="listitem" className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${row.paid_at ? "bg-lime text-lime-foreground" : "bg-muted text-muted-foreground"}`}>
            {row.paid_at ? <Check className="size-5" /> : <Clock className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-medium">{row.label}</div>
            {row.sub && <div className="text-sm text-muted-foreground">{row.sub}</div>}
          </div>
          <div className="text-right">
            <div className="font-semibold tabular">{money(row.amount)}</div>
            {row.paid_at && <div className="text-sm text-gain">{dateShort(row.paid_at)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
