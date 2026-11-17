"use client";

import {
  ArrowUp,
  BatteryFull,
  ChevronLeft,
  CircleDollarSign,
  Folder,
  Maximize2,
  Mic,
  Moon,
  Plus,
  Search,
  Share,
  Signal,
  Truck,
  User,
  Volume2,
  Wifi,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ease, easeOut, lerp, useHeroStore } from "./progress";

export type ChatBrief = {
  title: string;
  date: string;
  summary: string;
  stats: { icon: ReactNode; label: string }[];
  readTime: string;
  /** Sections of the expanded reader. */
  attention: { title: string; detail: string }[];
  overview: string[];
  issues: { title: string; detail: string }[];
  sources: string[];
};

export type ChatScreenProps = {
  assistant: string;
  status: string;
  /** Earlier message, already in the conversation when the screen appears. */
  history: string;
  /** The assistant's offer to prepare the brief. */
  offer: string;
  prompt: string;
  reply: string;
  brief: ChatBrief;
  suggestions: string[];
  placeholder: string;
  className?: string;
};

export const defaultChat: ChatScreenProps = {
  assistant: "Dispatch",
  status: "Monitoring",
  history: "Your dispatch board, mailbox and claims portal are linked. Anything I review overnight is filed in your Archive.",
  offer: "Your next scheduled digest lands tomorrow at 7:45 AM. Shall I put one together right now?",
  prompt: "Show me today's digest",
  reply: "Your digest is ready",
  brief: {
    title: "Daily Digest",
    date: "7:30 AM, Oct 3, 2026",
    summary: "Revenue is trending above last week. One vendor payment is waiting for your sign-off.",
    stats: [
      { icon: <CircleDollarSign />, label: "$92.7K billed revenue" },
      { icon: <Truck />, label: "31/40 vehicles scheduled" },
    ],
    readTime: "3 min read",
    attention: [
      { title: "Sign off on $2,150 tow invoice", detail: "The towing vendor will not release vehicle 7730 until the invoice is approved." },
      { title: "Schedule a service slot for van 214", detail: "Its quarterly check is due Tuesday and nothing is booked yet." },
    ],
    overview: [
      "Billed revenue reached $92.7K, up 5.1% since Wednesday.",
      "31 of 40 vehicles are scheduled; nine remain open for next week.",
      "One of four upcoming checks is booked.",
    ],
    issues: [
      { title: "$13.2K refund pending", detail: "The claims team is gathering the incident photos and repair quotes the carrier requested." },
      { title: "Waiting time on order 6104", detail: "The customer kept the crew on site for 2 hours. A surcharge draft is ready." },
    ],
    sources: ["Vehicles", "Claims", "Compliance", "Billing"],
  },
  suggestions: ["Why is revenue up?", "Compare it with last week"],
  placeholder: "Ask Dispatch",
};

// The chat plays itself like a conversation, with typing dots before the assistant replies. Scrolling
// ahead hurries it, but each beat keeps a minimum gap so messages never pop in together.
// at: ms after load; seen: scroll progress that makes the beat due early; gap: ms since the last beat.
const BEATS = [
  { at: 300, seen: 0.03, gap: 0 },
  { at: 1300, seen: 0.075, gap: 380 },
  { at: 1900, seen: 0.12, gap: 300, typing: true },
  { at: 3000, seen: 0.15, gap: 650 },
  { at: 3550, seen: 0.24, gap: 380 },
  { at: 4200, seen: 0.33, gap: 380 },
];
const BRIEF_BEAT = 5;
const REVEAL_DELAYS = { lead: 0, divider: 40, attention: 90, overview: 140, issues: 190, sources: 240, footer: 290 };
const REVEAL_DURATION = 400;
const DESIGN = { width: 402, height: 876 };

/** Messages arrive by rising, scaling and fading in. */
function Arrive({ shown, children, className }: { shown: boolean; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "transition-[opacity,transform] duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
        shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-[15px] scale-[.96] opacity-0",
        className,
      )}
      aria-hidden={!shown}
    >
      {children}
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex h-[54px] items-end justify-between px-[38px] pb-1 text-[17px] font-semibold">
      <span className="tabular-nums">9:41</span>
      <span className="flex items-center gap-1.5 [&_svg]:size-[18px]">
        <Signal />
        <Wifi />
        <BatteryFull />
      </span>
    </div>
  );
}

/** Speaks the brief with the browser's speech synthesis. */
function useReadAloud(text: string) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  const toggle = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (synth.speaking) {
      synth.cancel();
      setPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = utterance.onerror = () => setPlaying(false);
    synth.speak(utterance);
    setPlaying(true);
  };
  return { playing, toggle };
}

/** A chat: a conversation that plays in, then a brief card that opens into a reader as the hero scrolls. */
export function ChatScreen(props: Partial<ChatScreenProps>) {
  const { assistant, status, history, offer, prompt, reply, brief, suggestions, placeholder, className } = {
    ...defaultChat,
    ...props,
  };
  const store = useHeroStore();
  const [done, setDone] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardButtonRef = useRef<HTMLButtonElement>(null);
  const morphRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const readerButtonRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyWindowRef = useRef<HTMLDivElement>(null);
  const speech = useReadAloud(
    [brief.title, brief.date, brief.summary, ...brief.attention.map((a) => `${a.title}. ${a.detail}`), ...brief.overview].join(". "),
  );

  // Conversation pacing, driven by time since mount and by how far the visitor has scrolled.
  useEffect(() => {
    const chat = { done: 0, last: -1e4, start: null as number | null, timer: 0 };
    const tick = () => {
      const time = performance.now();
      const { seen, reduced } = store.get();
      if (chat.start === null) chat.start = time;
      if (reduced) chat.done = BEATS.length;
      while (chat.done < BEATS.length) {
        const beat = BEATS[chat.done]!;
        if ((time - chat.start < beat.at && seen < beat.seen) || time - chat.last < beat.gap) break;
        chat.done++;
        chat.last = time;
      }
      setDone(chat.done);
      store.setReady(chat.done >= BRIEF_BEAT);
      clearTimeout(chat.timer);
      if (chat.done < BEATS.length) {
        const beat = BEATS[chat.done]!;
        const wait = Math.max(chat.last + beat.gap - time, seen >= beat.seen ? 0 : chat.start + beat.at - time);
        chat.timer = window.setTimeout(tick, Math.max(16, wait));
      }
    };
    store.setReady(false);
    const unsubscribe = store.subscribe(tick);
    tick();
    return () => {
      unsubscribe();
      clearTimeout(chat.timer);
      store.setReady(true);
    };
  }, [store]);

  // Card-to-reader expansion and the reader's scroll, applied per frame without re-rendering.
  useEffect(() => {
    const apply = () => {
      const { expansion, contentElapsed, detailProgress } = store.get();
      const card = cardRef.current;
      const reader = readerRef.current;
      const morph = morphRef.current;
      if (!card || !reader || !morph) return;
      const top = card.offsetTop;
      const left = card.offsetLeft;
      const right = DESIGN.width - left - card.offsetWidth;
      const bottom = DESIGN.height - top - card.offsetHeight;
      card.style.visibility = expansion > 0.0001 ? "hidden" : "";
      reader.style.opacity = String(ease(expansion / 0.75));
      reader.style.clipPath = `inset(${lerp(top, 0, expansion)}px ${lerp(right, 0, expansion)}px ${lerp(bottom, 0, expansion)}px ${lerp(left, 0, expansion)}px round ${lerp(25, 0, expansion)}px)`;
      reader.inert = expansion < 0.999;
      reader.setAttribute("aria-hidden", String(expansion < 0.1));
      Object.assign(morph.style, {
        left: `${lerp(left, 0, expansion)}px`,
        top: `${lerp(top, 0, expansion)}px`,
        width: `${lerp(card.offsetWidth, DESIGN.width, expansion)}px`,
        height: `${lerp(card.offsetHeight, DESIGN.height, expansion)}px`,
        borderRadius: `${lerp(25, 0, expansion)}px`,
        opacity: expansion > 0.0001 ? String(1 - ease(expansion / 0.85)) : "0",
      });
      reader.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        const delay = REVEAL_DELAYS[el.dataset.reveal as keyof typeof REVEAL_DELAYS];
        const amount = contentElapsed < 0 ? 0 : easeOut((contentElapsed - delay) / REVEAL_DURATION);
        el.style.opacity = String(amount * ease(expansion / 0.88));
        el.style.transform = amount >= 1 ? "none" : `translateY(${(1 - amount) * 12}px)`;
        el.style.filter = amount >= 1 ? "none" : `blur(${(1 - amount) * 2}px)`;
      });
      const body = bodyRef.current;
      const bodyWindow = bodyWindowRef.current;
      if (body && bodyWindow) {
        const distance = Math.max(0, body.offsetHeight - bodyWindow.clientHeight);
        body.style.transform = `translateY(${-detailProgress * distance}px)`;
      }
      if (cardButtonRef.current) cardButtonRef.current.disabled = expansion > 0.0001;
      if (readerButtonRef.current) readerButtonRef.current.disabled = expansion < 0.98;
    };
    apply();
    return store.subscribe(apply);
  }, [store]);

  // Beats 0, 1, 3, 4, 5 each show one item; beat 2 starts the typing dots, which the reply replaces.
  const shown = done - (done > 2 ? 1 : 0);
  const typing = done === 3;
  const briefShown = done >= BRIEF_BEAT;

  return (
    <div className={cn("relative h-[876px] w-[402px] overflow-hidden bg-background text-foreground", className)}>
      <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-background from-60% to-transparent pb-6">
        <StatusBar />
        <div className="relative mt-2 flex h-[52px] items-center justify-center px-4">
          <div className="flex items-center gap-2.5 rounded-full border bg-card/90 py-1 pr-6 pl-1 shadow-sm backdrop-blur">
            <span className="flex size-11 items-center justify-center rounded-full bg-foreground text-background">
              <Moon className="size-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[17px] font-medium">{assistant}</span>
              <span className="text-[14px] text-muted-foreground">{status}</span>
            </span>
          </div>
          <span className="absolute right-4 flex size-[52px] items-center justify-center rounded-full border bg-card/90 shadow-sm">
            <Search className="size-6" />
          </span>
        </div>
      </div>

      <div className="absolute inset-x-[15px] bottom-[244px] flex flex-col gap-[15px] text-[17px] leading-[23px] tracking-[-0.01em]">
        <div className="w-fit max-w-[83%] rounded-[22px] rounded-bl-[8px] border bg-muted px-[17px] py-[10px]">{history}</div>
        <Arrive shown={shown > 0} className="w-fit max-w-[83%] rounded-[22px] rounded-bl-[8px] border bg-muted px-[17px] py-[10px]">
          {offer}
        </Arrive>
        <Arrive shown={shown > 1} className="self-end rounded-[22px] bg-primary px-[17px] py-[10px] text-primary-foreground">
          {prompt}
        </Arrive>
        <div className="relative">
          <Arrive shown={shown > 2} className="w-fit rounded-[22px] border bg-muted px-[17px] py-[10px]">
            {reply}
          </Arrive>
          <div
            aria-hidden
            className={cn(
              "absolute top-1 left-0 flex origin-left gap-1 rounded-[24px] bg-muted px-4 py-3 transition-[opacity,transform] duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
              typing ? "translate-y-0 scale-100 opacity-100" : "translate-y-[10px] scale-[.94] opacity-0",
            )}
          >
            {[0, 150, 300].map((delay) => (
              <i
                key={delay}
                className="size-1.5 rounded-full bg-muted-foreground/60 motion-reduce:animate-none"
                style={{ animation: "psh-dot 1s infinite", animationDelay: `${delay}ms`, animationPlayState: typing ? "running" : "paused" }}
              />
            ))}
          </div>
        </div>
        <Arrive shown={shown > 3} className="w-[272px]">
          <div ref={cardRef} className="relative h-[258px] w-[272px] rounded-[25px] border bg-gradient-to-b from-card to-muted px-[22px] pt-[20px] pb-4">
            <div className="flex items-start justify-between">
              <h3 className="text-[26px] leading-[32px] font-bold tracking-[-0.02em]">{brief.title}</h3>
              <Maximize2 className="mt-1.5 size-4 text-muted-foreground" />
            </div>
            <p className="mt-0.5 text-[15px] text-muted-foreground tabular-nums">{brief.date}</p>
            <p className="mt-4 border-l-2 pl-3 text-[15px] leading-[20px] text-muted-foreground">{brief.summary}</p>
            <ul className="mt-3 space-y-1.5 text-[14px] font-semibold text-muted-foreground [&_svg]:size-4">
              {brief.stats.map((stat) => (
                <li key={stat.label} className="flex items-center gap-2 tabular-nums">
                  {stat.icon}
                  {stat.label}
                </li>
              ))}
            </ul>
            <div className="absolute inset-x-[16px] bottom-[14px] flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">{brief.readTime}</span>
              <button
                ref={cardButtonRef}
                type="button"
                onClick={speech.toggle}
                disabled={!briefShown}
                aria-pressed={speech.playing}
                aria-label={speech.playing ? "Pause the sample brief" : "Read the sample brief aloud"}
                className="pointer-events-auto flex items-center gap-1.5 rounded-full border bg-background/80 px-3.5 py-1.5 text-[15px] font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:ring-2 aria-pressed:ring-primary"
              >
                <Volume2 className="size-4" /> Read Aloud
              </button>
            </div>
          </div>
        </Arrive>
        <Arrive shown={shown > 4} className="flex flex-col items-start gap-2.5 text-[15px] text-muted-foreground">
          {suggestions.map((suggestion) => (
            <span key={suggestion} className="rounded-full bg-muted px-3.5 py-2">
              {suggestion}
            </span>
          ))}
        </Arrive>
      </div>

      <div className="absolute inset-x-[15px] bottom-[90px] flex items-center gap-3">
        <span className="flex size-[48px] flex-none items-center justify-center rounded-full border bg-card shadow-sm">
          <Plus className="size-6" />
        </span>
        <span className="flex h-[48px] flex-1 items-center justify-between rounded-full border bg-card px-5 text-[17px] text-muted-foreground shadow-sm">
          {placeholder}
          <Mic className="size-5" />
        </span>
      </div>
      <nav aria-hidden className="absolute inset-x-[60px] bottom-[20px] flex h-[62px] items-center rounded-full border bg-card p-1 text-[12px] font-semibold shadow-sm [&_svg]:size-5">
        <span className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-full bg-muted">
          <Moon />
          {assistant}
        </span>
        <span className="flex flex-1 flex-col items-center gap-0.5">
          <Folder />
          Library
        </span>
        <span className="flex flex-1 flex-col items-center gap-0.5">
          <User />
          Profile
        </span>
      </nav>

      <div ref={morphRef} aria-hidden className="pointer-events-none absolute z-20 bg-gradient-to-b from-card to-muted opacity-0" />

      <div ref={readerRef} className="absolute inset-0 z-30 bg-background opacity-0" aria-hidden>
        <StatusBar />
        <div className="flex h-[44px] items-center justify-between px-4 [&_svg]:size-6">
          <span className="flex size-11 items-center justify-center rounded-full border bg-card">
            <ChevronLeft />
          </span>
          <span className="flex gap-2">
            <button
              ref={readerButtonRef}
              type="button"
              onClick={speech.toggle}
              aria-pressed={speech.playing}
              aria-label={speech.playing ? "Pause the sample brief" : "Read the sample brief aloud"}
              className="flex size-11 items-center justify-center rounded-full border bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:ring-2 aria-pressed:ring-primary"
            >
              <Volume2 />
            </button>
            <span className="flex size-11 items-center justify-center rounded-full border bg-card">
              <Share />
            </span>
          </span>
        </div>
        <div data-reveal="lead" className="absolute top-[124px] left-4 w-[370px]">
          <h3 className="text-[34px] leading-[41px] font-bold tracking-[-0.02em]">{brief.title}</h3>
          <p className="mt-1 text-[15px] text-muted-foreground tabular-nums">{brief.date}</p>
        </div>
        <div ref={bodyWindowRef} className="absolute top-[200px] right-0 bottom-0 left-0 overflow-hidden">
          <div ref={bodyRef} className="mx-4 w-[370px] pb-[110px] text-[16px] leading-[22px]">
            <p data-reveal="lead" className="border-l-2 pl-3 text-[17px] leading-[24px] text-muted-foreground">
              {brief.summary}
            </p>
            <hr data-reveal="divider" className="my-5 border-border" />
            <section data-reveal="attention">
              <h4 className="mb-2 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">Needs attention</h4>
              <ul className="space-y-2.5">
                {brief.attention.map((item) => (
                  <li key={item.title} className="rounded-2xl border bg-card p-3.5">
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-0.5 text-[15px] text-muted-foreground">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section data-reveal="overview" className="mt-6">
              <h4 className="mb-2 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">Overview</h4>
              <ul className="list-disc space-y-1.5 pl-5">
                {brief.overview.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
            <section data-reveal="issues" className="mt-6">
              <h4 className="mb-2 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">Open issues</h4>
              <ul className="divide-y rounded-2xl border bg-card">
                {brief.issues.map((item) => (
                  <li key={item.title} className="p-3.5">
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-0.5 text-[15px] text-muted-foreground">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section data-reveal="sources" className="mt-6">
              <h4 className="mb-2 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">Sources</h4>
              <div className="flex flex-wrap gap-2">
                {brief.sources.map((source) => (
                  <span key={source} className="rounded-full border bg-card px-3 py-1 text-[14px]">
                    {source}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
        <div data-reveal="footer" className="absolute inset-x-4 bottom-[24px] z-10 flex h-[50px] items-center justify-between rounded-full border bg-card pr-1.5 pl-5 text-[17px] text-muted-foreground shadow-sm">
          Ask about this brief
          <span className="flex size-[38px] items-center justify-center rounded-full bg-foreground text-background">
            <ArrowUp className="size-5" />
          </span>
        </div>
      </div>
    </div>
  );
}
