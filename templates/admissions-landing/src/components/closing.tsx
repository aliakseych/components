import { cta, faq, footer } from "@/sample/content";
import { config } from "@/template.config";
import { cn } from "@/lib/utils";
import { ButtonLink, Container, focusRing } from "./ui";

export function Faq() {
  return (
    <section id="faqs" className="py-16">
      <Container className="grid grid-cols-1 gap-x-2 gap-y-8 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h2 className="font-serif text-[2rem] leading-[1.1] tracking-tight text-pretty text-olive-950 sm:text-5xl sm:leading-[1.1] dark:text-white">
            {faq.title}
          </h2>
          <div className="text-base/7 text-olive-700 dark:text-olive-400">
            <p>{faq.body}</p>
          </div>
        </div>
        <div className="divide-y divide-olive-950/10 border-y border-olive-950/10 dark:divide-white/10 dark:border-white/10">
          {faq.items.map((item) => (
            <details key={item.q} className="group">
              <summary
                className={cn(
                  "flex w-full cursor-pointer items-start justify-between gap-6 py-4 text-left text-base/7 text-olive-950 list-none dark:text-white [&::-webkit-details-marker]:hidden",
                  focusRing,
                )}
              >
                {item.q}
                <svg viewBox="0 0 13 13" width="13" height="13" fill="none" aria-hidden="true" className="mt-2 h-[13px] shrink-0 group-open:hidden">
                  <path d="M6.5 0v13M0 6.5h13" stroke="currentColor" />
                </svg>
                <svg viewBox="0 0 13 1" width="13" height="1" fill="none" aria-hidden="true" className="mt-3 hidden shrink-0 group-open:inline-block">
                  <path d="M0 .5h13" stroke="currentColor" />
                </svg>
              </summary>
              <div className="-mt-2 pr-12 pb-4 text-sm/7 text-olive-700 dark:text-olive-400">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function CallToAction() {
  return (
    <section id="call-to-action" className="py-16">
      <Container className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-4xl font-serif text-[2rem] leading-[1.1] tracking-tight text-pretty text-olive-950 sm:text-5xl sm:leading-[1.1] dark:text-white">
            {cta.title}
          </h2>
          <div className="max-w-3xl text-base/7 text-pretty text-olive-700 dark:text-olive-400">
            <p>{cta.body}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ButtonLink href={cta.primary.href} className="font-normal">{cta.primary.label}</ButtonLink>
          <ButtonLink href={cta.secondary.href} variant="ghost" className="gap-2 font-normal">
            {cta.secondary.label}
            <svg viewBox="0 0 13 7" width="13" height="7" fill="none" aria-hidden="true">
              <path d="M0 3.5h12M9 .5l3 3-3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="pt-16">
      <div className="bg-olive-950/[0.025] py-16 dark:bg-white/5">
        <Container className="flex flex-col gap-16">
          <nav aria-label="Footer" className="grid grid-cols-2 gap-6 text-sm/7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {footer.columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-olive-950 dark:text-white">{col.title}</h3>
                <ul className="mt-2 flex flex-col gap-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href={`#${l.toLowerCase().replace(/\s+/g, "-")}`} className={cn("rounded-sm text-olive-700 hover:text-olive-950 dark:text-olive-400 dark:hover:text-white", focusRing)}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="flex flex-col gap-1">
            <p className="text-sm/7 text-olive-600 dark:text-olive-500">{config.legal}</p>
            <p className="text-[11px] leading-relaxed text-olive-500">{footer.disclaimer}</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
