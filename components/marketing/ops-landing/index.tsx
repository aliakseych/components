import { useRef, type ComponentProps, type ReactNode } from "react";
import { AlertTriangle, BellRing, CheckCircle2, Clock3, History, Link2, MapPin, Plug, Truck, Wallet, Wrench } from "lucide-react";
import { ScrollPillHeader } from "@/components/marketing/scroll-pill-header";
import { PhoneScrollHero } from "@/components/hero-page/phone-scroll-hero";
import { InlineImageHeadline } from "@/components/marketing/inline-image-headline";
import { PhoneFeatureTabs } from "@/components/marketing/phone-feature-tabs";
import { PhoneListScreen, PhoneSplitFeature } from "@/components/marketing/phone-split-feature";
import { SetupSteps } from "@/components/marketing/setup-steps";
import { IntegrationGrid } from "@/components/marketing/integration-grid";
import { ChatTestimonials } from "@/components/marketing/chat-testimonials";
import { FaqStack } from "@/components/marketing/faq-stack";
import { NightCta } from "@/components/marketing/night-cta";

export interface OpsLandingProps {
  header?: ComponentProps<typeof ScrollPillHeader>;
  hero?: ComponentProps<typeof PhoneScrollHero>;
  intro?: ComponentProps<typeof InlineImageHeadline>;
  features?: ComponentProps<typeof PhoneFeatureTabs>;
  integrations?: ComponentProps<typeof IntegrationGrid>;
  splitPrimary?: ComponentProps<typeof PhoneSplitFeature>;
  splitSecondary?: ComponentProps<typeof PhoneSplitFeature>;
  testimonials?: ComponentProps<typeof ChatTestimonials>;
  setup?: ComponentProps<typeof SetupSteps>;
  faq?: ComponentProps<typeof FaqStack>;
  cta?: ComponentProps<typeof NightCta>;
  /** Brand name used in the header, pill, copy and footer. Default "Relay". */
  brandName?: string;
  className?: string;
}

const tile = (hue: number, path: ReactNode) => (
  <span className="grid size-full place-items-center rounded-[inherit] text-white" style={{ background: `linear-gradient(145deg, oklch(0.7 0.19 ${hue}), oklch(0.5 0.2 ${hue + 30}))` }}>
    <svg className="size-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
  </span>
);

const pills = [
  { label: "Locations", image: <MapPin className="size-full text-sky-600 dark:text-sky-300" /> },
  { label: "Alerts", image: <AlertTriangle className="size-full text-red-500 dark:text-red-300" /> },
  { label: "Repairs", image: <Wrench className="size-full text-amber-600 dark:text-amber-300" /> },
  { label: "Money", image: <Wallet className="size-full text-emerald-600 dark:text-emerald-300" /> },
  { label: "Fleet", image: <Truck className="size-full text-violet-600 dark:text-violet-300" /> },
];

const integrationItems = [
  { name: "Ledger", icon: tile(262, <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 9h8M8 12h8M8 15h5" /></>) },
  { name: "Dispatch", icon: tile(200, <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17" r="1.6" /><circle cx="17" cy="17" r="1.6" /></>) },
  { name: "Mailroom", icon: tile(330, <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 8 8 6 8-6" /></>) },
  { name: "Calendar", icon: tile(215, <><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></>) },
  { name: "Payments", icon: tile(150, <><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M3 10h18M7 15h3" /></>) },
  { name: "Telemetry", icon: tile(28, <path d="M3 13h4l3-7 4 12 3-5h4" />) },
];

const Screen = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex h-full flex-col bg-background px-4 pb-6 pt-12 text-foreground">
    <div className="mb-4 flex items-center gap-2">
      <span className="size-7 rounded-full bg-foreground" />
      <span className="text-sm font-semibold">{title}</span>
    </div>
    <div className="flex flex-1 flex-col gap-2.5 overflow-hidden">{children}</div>
  </div>
);
const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-2xl border bg-card px-3.5 py-3 text-[13px]">
    <span>{label}</span>
    <span className="text-muted-foreground">{value}</span>
  </div>
);

const featureItems = [
  { title: "Briefs", description: "A calm daily overview that puts the urgent items on top.", screen: <Screen title="Morning brief"><Row label="2 jobs behind" value="Review" /><Row label="1 invoice overdue" value="Send" /><Row label="3 replies waiting" value="Draft" /><Row label="Pickup moved to Friday" value="Confirm" /><Row label="Fuel card flagged" value="Check" /><Row label="Weekly summary ready" value="Read" /></Screen> },
  { title: "Fleet", description: "Faults, maintenance gaps and missing locations in one list.", screen: <Screen title="Fleet"><Row label="Unit 12 · brake warning" value="Fault" /><Row label="Unit 07 · service due" value="3 days" /><Row label="Unit 03 · location lost" value="14 min" /><Row label="Unit 09 · tyre pressure" value="Low" /><Row label="Unit 15 · inspection" value="Due Fri" /><Row label="Unit 21 · all clear" value="OK" /></Screen> },
  { title: "Coverage", description: "Policies and renewals, flagged before they cost you.", screen: <Screen title="Coverage"><Row label="Cargo policy" value="Renews in 12 d" /><Row label="Driver add-ons" value="2 missing" /><Row label="Liability cover" value="Active" /><Row label="Trailer certificate" value="Expires Mar" /><Row label="Broker contact" value="Updated" /><Row label="Claims open" value="1" /></Screen> },
  { title: "Safety", description: "Incidents and training reminders, surfaced as they happen.", screen: <Screen title="Safety"><Row label="Fleet score" value="92 / 100" /><Row label="Training overdue" value="3 people" /><Row label="Hard braking events" value="4 today" /><Row label="Incident reports" value="1 open" /><Row label="Checklist completion" value="96%" /><Row label="Next review" value="Tue" /></Screen> },
  { title: "Money", description: "Track revenue, payouts and unpaid balances in one place.", screen: <Screen title="Money"><Row label="Gross this week" value="$48,200" /><Row label="Overdue" value="$2,400" /><Row label="Payouts pending" value="$9,150" /><Row label="Fuel spend" value="$6,780" /><Row label="Unpaid invoices" value="5" /><Row label="Forecast" value="+8%" /></Screen> },
];

const faqItems = [
  { question: "How is pricing structured?", answer: "One monthly plan covers the whole workspace, with no per-user fees and no lock-in." },
  { question: "Will everyone need training?", answer: "Not really. Teammates keep using their usual channels and the assistant posts updates there." },
  { question: "How does it learn about payments?", answer: "It reads notification emails you forward to it and never touches a financial account." },
  { question: "What if a flag turns out to be mistaken?", answer: "Each flag cites the records behind it. Nobody else is notified until you approve." },
  { question: "Can I take my data back and cancel?", answer: "Access is read-only, so cancelling is simple. Stored copies are erased on request." },
];

const testimonialItems = [
  { quote: "“It surfaced a duplicate charge that had gone unnoticed for months.”", author: "Ana Duarte · Operations Owner", company: "Northline Freight" },
  { quote: "“Every answer links to its source, so I can rely on it.”", author: "Sam Okafor · Operations Owner", company: "Okafor Haulage" },
  { quote: "“Daily status calls shrank to a quick read of one digest.”", author: "Jay Moreno · Operations Owner", company: "Bluebird Logistics" },
];

const cta = { label: "Book a call", href: "#book" };

/** Full operations-assistant landing page composed from library sections; every section accepts prop overrides. */
export function OpsLanding({ header, hero, intro, features, integrations, splitPrimary, splitSecondary, testimonials, setup, faq, cta: ctaProps, brandName = "Relay", className }: OpsLandingProps) {
  const endRef = useRef<HTMLDivElement>(null);
  return (
    <div className={className ?? "w-full bg-background text-foreground"}>
      <ScrollPillHeader boundary={endRef} onDark brand={<span className="text-xl font-semibold tracking-tight">{brandName}</span>} brandLabel="Home" links={[{ label: "Products", href: "#products" }, { label: "FAQ", href: "#faq" }]} cta={cta} {...header} />
      <div className="-mt-[82px] max-[800px]:-mt-[76px]">
        <PhoneScrollHero endRef={endRef} cta={cta} {...hero} />
      </div>
      <InlineImageHeadline
        pills={pills}
        segments={[
          { text: `${brandName} links your` },
          { visuals: [tile(215, <><rect x="4" y="6" width="16" height="12" rx="3" /><path d="m5 9 7 5 7-5" /></>)], text: "systems," },
          { text: "mailboxes and channels, highlights what" },
          { visuals: [tile(28, <path d="M12 4 21 19H3zM12 10v4" />)], text: "needs" },
          { text: "a look, and drafts your next step." },
        ]}
        {...intro}
      />
      <section id="products" className="w-full bg-[#f5f5f7] py-32 max-[800px]:py-20 dark:bg-[#161617]">
        <div className="mx-auto w-full max-w-[1296px] px-6 min-[801px]:px-12">
          <PhoneFeatureTabs heading={<>One assistant across<br />every part of the business.</>} items={featureItems} defaultIndex={1} {...features} />
        </div>
      </section>
      <IntegrationGrid title={<>Your assistant works with the tools<br className="max-[800px]:hidden" /> you already use.</>} items={integrationItems} {...integrations} />
      <PhoneSplitFeature
        title="All your tools, one view."
        description="Browse each linked app, when it last synced and any issue that needs a look."
        bullets={[{ icon: <Plug />, text: "Every linked app on one screen" }, { icon: <Clock3 />, text: "Sync times visible instantly" }, { icon: <BellRing />, text: "Alerts whenever a link drops" }]}
        cta={cta}
        phoneLabel="Connected systems list on a phone"
        phone={<PhoneListScreen heading="Connected systems" rows={[{ title: "Fleet telematics", meta: "Updated 2 min ago" }, { title: "Accounting", meta: "Updated 14 min ago" }, { title: "Bank alerts", meta: "Reconnect needed", tone: "warn" }]} />}
        {...splitPrimary}
      />
      <PhoneSplitFeature
        reversed
        phonePosition="bottom"
        title="Nothing happens without you."
        description="Review each finding, trace where it came from and sign off on what follows."
        bullets={[{ icon: <Link2 />, text: "Trace every finding" }, { icon: <CheckCircle2 />, text: "Sign off first" }, { icon: <History />, text: "Review the outcome" }]}
        cta={cta}
        phoneLabel="Approval request on a phone"
        phone={<PhoneListScreen heading="Needs your approval" anchor="bottom" rows={[{ title: "Invoice 4821 differs from the order", meta: "Two records disagree", tone: "bad" }, { title: "Reschedule Friday pickup", meta: "Source: dispatch notes", tone: "warn" }, { title: "Send reminder to vendor", meta: "Approved · sent 9:12", tone: "ok" }]} />}
        {...splitSecondary}
      />
      <ChatTestimonials title={`How teams work once ${brandName} joins.`} items={testimonialItems} ariaLabel="Owner testimonials" {...testimonials} />
      <section id="solutions"><SetupSteps {...setup} /></section>
      <section id="faq"><FaqStack title="Common questions from managers" items={faqItems} {...faq} /></section>
      <section id="book">
        <NightCta
          badge="Trusted by growing teams"
          title={<>Discover what {brandName} can<br className="max-[800px]:hidden" /> lift off your desk.</>}
          actions={[cta, { label: "hello@example.com", href: "mailto:hello@example.com", variant: "ghost" }]}
          footer={{
            brand: brandName,
            columns: [
              { heading: brandName, links: [{ label: "Blog", href: "#blog" }, { label: "hello@example.com", href: "mailto:hello@example.com" }] },
              { heading: "Legal", links: [{ label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#terms" }] },
            ],
            legal: "© 2026 Example Corporation",
          }}
          {...ctaProps}
        />
      </section>
    </div>
  );
}

export default OpsLanding;
