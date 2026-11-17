import type { ReactNode } from "react";
import { PhoneFeatureTabs, type PhoneFeatureItem } from "../index";

function Screen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-background px-4 pb-6 pt-12 text-foreground">
      <div className="mb-4 flex items-center gap-2">
        <span className="size-7 rounded-full bg-foreground" />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden">{children}</div>
      <div className="mt-3 rounded-full border bg-card px-4 py-2.5 text-xs text-muted-foreground">Ask anything…</div>
    </div>
  );
}

const Bubble = ({ mine, children }: { mine?: boolean; children: ReactNode }) => (
  <div className={mine ? "ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-foreground px-3.5 py-2.5 text-[13px] leading-[18px] text-background" : "max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5 text-[13px] leading-[18px]"}>{children}</div>
);

const Row = ({ label, value, tone }: { label: string; value: string; tone?: boolean }) => (
  <div className="flex items-center justify-between rounded-2xl border bg-card px-3.5 py-3 text-[13px]">
    <span>{label}</span>
    <span className={tone ? "font-semibold text-foreground" : "text-muted-foreground"}>{value}</span>
  </div>
);

const items: PhoneFeatureItem[] = [
  {
    title: "Briefs",
    description: "A calm daily overview that puts the urgent items on top.",
    screen: (
      <Screen title="Morning brief">
        <Bubble>Good morning. Three things need you today.</Bubble>
        <Row label="2 jobs behind schedule" value="Review" tone />
        <Row label="1 invoice overdue" value="Send" tone />
        <Row label="Weather alert, north zone" value="FYI" />
        <Bubble mine>Move the late jobs to tomorrow.</Bubble>
        <Bubble>Done. I notified both customers.</Bubble>
      </Screen>
    ),
  },
  {
    title: "Fleet",
    description: "Faults, maintenance gaps, and missing locations in one list.",
    screen: (
      <Screen title="Fleet">
        <Row label="Unit 12 · brake warning" value="Fault" tone />
        <Row label="Unit 07 · service due" value="3 days" />
        <Row label="Unit 21 · no location" value="2 h" tone />
        <Row label="Unit 03 · healthy" value="OK" />
        <Bubble mine>Book a slot for unit 12.</Bubble>
        <Bubble>Booked for Thursday 9:00 at the north depot.</Bubble>
      </Screen>
    ),
  },
  {
    title: "Insurance",
    description: "Policies, renewals and coverage gaps, flagged before they cost you.",
    screen: (
      <Screen title="Coverage">
        <Row label="Liability policy" value="Active" />
        <Row label="Cargo policy" value="Renews in 12 d" tone />
        <Row label="Driver add-ons" value="2 missing" tone />
        <Bubble mine>What is missing?</Bubble>
        <Bubble>Two new drivers are not yet on the policy. Want me to request a quote?</Bubble>
      </Screen>
    ),
  },
  {
    title: "Safety",
    description: "Incidents, scores and training reminders, surfaced as they happen.",
    screen: (
      <Screen title="Safety">
        <Row label="Fleet score" value="92 / 100" tone />
        <Row label="Harsh braking events" value="4 this week" />
        <Row label="Training overdue" value="3 people" tone />
        <Bubble>Two events came from the same route.</Bubble>
        <Bubble mine>Remind the team about it.</Bubble>
      </Screen>
    ),
  },
  {
    title: "Money",
    description: "Track revenue, payouts, and unpaid balances in one place.",
    screen: (
      <Screen title="Money">
        <Row label="Gross this week" value="$48,200" tone />
        <Row label="Paid out" value="$31,900" />
        <Row label="Pending" value="$16,300" />
        <Row label="Overdue" value="$2,400" tone />
        <Bubble mine>Chase the overdue ones.</Bubble>
        <Bubble>Reminders sent to three customers.</Bubble>
      </Screen>
    ),
  },
];

export default function Demo() {
  return (
    <div className="w-full bg-muted py-16"><div className="mx-auto w-full max-w-[1296px] px-6 min-[801px]:px-12">
      <PhoneFeatureTabs heading={<>One assistant across<br />every part of the business.</>} items={items} defaultIndex={1} />
    </div></div>
  );
}
