import { CheckIcon, CircleDashedIcon, LoaderCircleIcon, XIcon } from "lucide-react";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../index";

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs">
      <header className="flex flex-col gap-0.5">
        <h2 className="font-semibold tracking-tight">Agent run</h2>
        <p className="text-sm text-muted-foreground tabular-nums">2 of 5 steps done, 1 failed.</p>
      </header>
      <Trace className="border-t pt-4">
        <TraceCollapsible defaultOpen>
          <TraceCollapsibleTrigger>
            <TraceLine>
              <TraceIcon className="text-chart-4"><CheckIcon /></TraceIcon>
              <TraceTitle>Searched the web</TraceTitle>
              <TraceDescription>12 results</TraceDescription>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <code className="block rounded-md bg-muted px-3 py-2 font-mono text-xs break-all">query: "saas churn benchmarks 2026"</code>
          </TraceCollapsibleContent>
        </TraceCollapsible>
        <TraceLine>
          <TraceIcon className="text-chart-4"><CheckIcon /></TraceIcon>
          <TraceTitle>Read the Q3 report</TraceTitle>
          <TraceDescription>1.4 s</TraceDescription>
        </TraceLine>
        <TraceCollapsible>
          <TraceCollapsibleTrigger>
            <TraceLine status="error">
              <TraceIcon><XIcon /></TraceIcon>
              <TraceTitle>Fetch billing export</TraceTitle>
              <TraceDescription className="text-destructive">403</TraceDescription>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>The token cannot read billing data, so this step was skipped.</TraceCollapsibleContent>
        </TraceCollapsible>
        <TraceLine status="running">
          <TraceIcon className="text-chart-2"><LoaderCircleIcon className="animate-spin motion-reduce:animate-none" /></TraceIcon>
          <TraceTitle>Comparing churn by plan</TraceTitle>
        </TraceLine>
        <TraceLine status="pending">
          <TraceIcon><CircleDashedIcon /></TraceIcon>
          <TraceTitle>Write the summary</TraceTitle>
        </TraceLine>
      </Trace>
    </div>
  );
}
