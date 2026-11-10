import { Card } from "@/components/ui/card";
import { Conversation } from "../index";

const growth = [
  { name: "Cotton yarn", value: 52 },
  { name: "Copper cathodes", value: 47 },
  { name: "Dried fruit", value: 41 },
];

const turns = [
  {
    id: "1",
    role: "user" as const,
    content: "Which exports grew fastest this year?",
    footer: "10:41",
  },
  {
    id: "2",
    role: "assistant" as const,
    content: (
      <div className="flex max-w-full flex-col gap-3">
        <p>Three exports grew by more than 40%:</p>
        <ul className="flex w-96 max-w-full flex-col gap-2 rounded-lg border bg-background p-3">
          {growth.map((row) => (
            <li className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 text-xs" key={row.name}>
              <span className="truncate">{row.name}</span>
              <span className="h-1.5 rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-chart-1"
                  style={{ width: `${row.value}%` }}
                />
              </span>
              <span className="text-right font-medium tabular-nums">+{row.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    ),
    footer: "10:42",
  },
  { id: "3", role: "user" as const, content: "Show that by quarter.", footer: "10:43" },
];

export default function Demo() {
  return (
    <Card className="w-full max-w-2xl gap-0 py-0">
      <header className="flex flex-col gap-0.5 border-b px-4 py-3">
        <h2 className="font-semibold tracking-tight">Export analysis</h2>
        <p className="text-muted-foreground text-sm">3 messages, updated 10:43</p>
      </header>
      <Conversation
        assistantName="Analyst"
        busy
        className="p-4"
        onCopy={() => {}}
        onFeedback={() => {}} onRegenerate={() => {}}
        turns={turns}
        
      />
    </Card>
  );
}
