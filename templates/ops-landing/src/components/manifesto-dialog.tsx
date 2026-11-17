import { useEffect, useRef, useState, type RefObject } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Manifesto {
  title: string;
  lead: string;
  paragraphs: string[];
  signoff: string;
}

interface ManifestoDialogProps {
  open: boolean;
  onClose: () => void;
  manifesto: Manifesto;
  brandName: string;
  /** Page behind the sheet: frozen in place and made inert while open. */
  pageRef: RefObject<HTMLDivElement | null>;
}

type Phase = "closed" | "open" | "visible" | "closing";
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Torn-paper manifesto sheet over a blurred backdrop; the page stays frozen at its scroll position behind it. */
export function ManifestoDialog({ open, onClose, manifesto, brandName, pageRef }: ManifestoDialogProps) {
  const [phase, setPhase] = useState<Phase>("closed");
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const scrollY = useRef(0);

  // Open: freeze the page where it is, then fade in on the next frame.
  useEffect(() => {
    if (!open || phase !== "closed") return;
    trigger.current = document.activeElement as HTMLElement | null;
    scrollY.current = window.scrollY;
    const page = pageRef.current;
    if (page) {
      Object.assign(page.style, { position: "fixed", top: `${-scrollY.current}px`, left: "0", right: "0", width: "100%" });
      page.inert = true;
    }
    setPhase("open");
  }, [open, phase, pageRef]);

  useEffect(() => {
    if (phase !== "open") return;
    dialogRef.current?.scrollTo(0, 0);
    closeRef.current?.focus({ preventScroll: true });
    const frame = requestAnimationFrame(() => setPhase("visible"));
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // Close: let the sheet slide out (0.45s), then restore the page, its scroll position and focus.
  useEffect(() => {
    if (!open && (phase === "open" || phase === "visible")) setPhase("closing");
  }, [open, phase]);

  useEffect(() => {
    if (phase !== "closing") return;
    const timer = setTimeout(
      () => {
        const page = pageRef.current;
        if (page) {
          for (const key of ["position", "top", "left", "right", "width"] as const) page.style[key] = "";
          page.inert = false;
        }
        window.scrollTo({ top: scrollY.current, behavior: "instant" });
        trigger.current?.focus({ preventScroll: true });
        setPhase("closed");
      },
      reduced() ? 0 : 510,
    );
    return () => clearTimeout(timer);
  }, [phase, pageRef]);

  useEffect(() => {
    if (phase === "closed" || phase === "closing") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

  if (phase === "closed") return null;
  const shown = phase === "visible";

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-0 z-[1000] bg-black/55 backdrop-blur-[6px] transition-opacity duration-300 ease-out motion-reduce:transition-none",
          shown ? "opacity-100" : "opacity-0",
        )}
      />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manifesto-title"
        data-lenis-prevent
        onClick={(event) => event.target === event.currentTarget && onClose()}
        className={cn(
          "fixed inset-0 z-[1001] overflow-y-auto overscroll-contain px-4 py-10 transition-opacity duration-300 ease-out motion-reduce:transition-none max-[600px]:px-2.5 max-[600px]:py-4",
          shown ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="mx-auto w-[min(728px,100%)] drop-shadow-[0_18px_45px_#0002]">
          <div
            className={cn(
              "manifesto-paper relative origin-[50%_15%] bg-white px-16 py-14 text-[#595959] transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transform-none motion-reduce:transition-none max-[600px]:px-7 max-[600px]:py-11 dark:bg-[#1c1c1e] dark:text-[#a1a1a6]",
              shown ? "transform-none" : "translate-y-7 -rotate-[0.7deg] scale-[0.985]",
            )}
          >
            <button
              ref={closeRef}
              type="button"
              aria-label="Close manifesto"
              onClick={onClose}
              className="absolute top-4 right-5 grid size-11 place-items-center rounded-full text-[#777] transition-colors hover:bg-[#eee] hover:text-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-[#a1a1a6] dark:hover:bg-white/10 dark:hover:text-[#f5f5f7]"
            >
              <X className="size-6" strokeWidth={1.75} />
            </button>
            <h2 id="manifesto-title" className="mb-5 text-[15px] leading-5 font-medium tracking-[.02em] text-[#8c8c8c] dark:text-[#a1a1a6]">
              {manifesto.title}
            </h2>
            <p className="mb-[22px] text-[25px] leading-[1.35] tracking-[-.2px] text-[#1a1a1a] max-[600px]:text-[22px] dark:text-[#f5f5f7]">
              <strong>{manifesto.lead}</strong>
            </p>
            {manifesto.paragraphs.map((text) => (
              <p key={text} className="mb-[22px] text-[19px] leading-[1.6] tracking-[-.2px] max-[600px]:text-[17px] max-[600px]:leading-[1.55]">
                {text}
              </p>
            ))}
            <p className="mt-8 mb-[22px] text-[19px] leading-[1.6] tracking-[-.2px] text-[#1a1a1a] max-[600px]:text-[17px] dark:text-[#f5f5f7]">
              {manifesto.signoff}
            </p>
            <div className="mt-9 text-[26px] leading-[30px] font-semibold tracking-tight text-[#1a1a1a] max-[600px]:mt-8 dark:text-[#f5f5f7]">{brandName}</div>
          </div>
        </div>
      </section>
    </>
  );
}
