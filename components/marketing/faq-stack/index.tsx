import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FaqStackItem = { question: string; answer: ReactNode };

export type FaqStackProps = {
  title: ReactNode;
  items: FaqStackItem[];
  /** Index open on first render; -1 for all closed. */
  defaultOpen?: number;
  className?: string;
};

/** Single-open FAQ list: grid-rows 0fr→1fr reveal (340/420ms), plus sign collapsing, instant when toggled by keyboard. */
export function FaqStack({ title, items, defaultOpen = 0, className }: FaqStackProps) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const [instant, setInstant] = useState(false);
  const ease = "ease-[cubic-bezier(.4,0,.2,1)]";

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn("bg-gradient-to-b from-[#f5f5f7] to-white py-32 text-[#1a1a1a] max-[800px]:py-20 dark:from-[#161617] dark:to-background dark:text-[#f5f5f7]", className)}
    >
      <div className="mx-auto w-full max-w-[1296px] px-12 max-[1199px]:px-8 max-[800px]:px-6 max-[380px]:px-5">
        <h2 id={`${id}-title`} className="text-center text-[56px] leading-[1.08] font-[590] tracking-[-0.23px] max-[1199px]:text-[42px] max-[800px]:text-[clamp(32px,7vw,44px)]">
          {title}
        </h2>
        <div className="mx-auto mt-16 w-[min(620px,100%)] max-[800px]:mt-10">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <article key={i} className="border-t border-[#dadada] first:border-t-0 dark:border-[#3a3a3c]">
                <h3>
                  <button
                    type="button"
                    id={`${id}-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${id}-a-${i}`}
                    onClick={(e) => {
                      setInstant(e.detail === 0);
                      setOpen(isOpen ? -1 : i);
                    }}
                    className={cn(
                      "grid w-full grid-cols-[minmax(0,1fr)_24px] max-[800px]:grid-cols-[minmax(0,1fr)_20px] items-start gap-6 py-8 text-left text-[22px] leading-7 font-bold tracking-[-0.26px] text-[#111214] hover:text-[#595959] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current max-[800px]:gap-4 max-[800px]:py-[26px] max-[800px]:text-[19px] max-[800px]:leading-[25px] dark:text-[#f5f5f7] dark:hover:text-[#a3a3a8]",
                      "motion-reduce:transition-none",
                      instant ? "transition-none" : cn("transition-[padding-bottom,color]", isOpen ? "duration-[420ms,200ms]" : "duration-[340ms,200ms]", ease),
                      isOpen && "pb-3 max-[800px]:pb-3",
                    )}
                  >
                    <span>{item.question}</span>
                    <span aria-hidden className="relative size-6 text-[#595959] max-[800px]:size-5 dark:text-[#a3a3a8]">
                      <span className="absolute top-[11px] left-[3px] h-0.5 w-[18px] rounded-sm bg-current max-[800px]:top-[9px] max-[800px]:left-0.5 max-[800px]:w-4" />
                      <span
                        className={cn(
                          "absolute top-[11px] left-[3px] h-0.5 w-[18px] rounded-sm bg-current max-[800px]:top-[9px] max-[800px]:left-0.5 max-[800px]:w-4 motion-reduce:transition-none",
                          instant ? "transition-none" : cn("transition-[transform,opacity] duration-[340ms,260ms]", ease),
                          isOpen ? "rotate-0 opacity-0" : "rotate-90",
                        )}
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={`${id}-a-${i}`}
                  role="region"
                  aria-labelledby={`${id}-q-${i}`}
                  aria-hidden={!isOpen}
                  inert={!isOpen}
                  className={cn(
                    "grid motion-reduce:transition-none",
                    instant ? "transition-none" : cn("transition-[grid-template-rows,opacity]", isOpen ? "duration-[420ms,260ms]" : "duration-[340ms,220ms]", ease),
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="pr-12 pb-8 text-xl tracking-[-0.26px] leading-[25px] text-[#595959] max-[800px]:pr-8 max-[800px]:pb-[26px] max-[800px]:text-[17px] max-[800px]:leading-6 dark:text-[#a3a3a8]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
