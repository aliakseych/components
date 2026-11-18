import { hero } from "@/sample/content";
import { cn } from "@/lib/utils";
import { DashboardMock } from "./dashboard-mock";
import { ButtonLink, Chevron, Container, focusRing, GradientFrame } from "./ui";

export function Hero() {
  return (
    <section id="hero" className="py-16">
      <Container className="flex flex-col gap-16">
        <div className="flex flex-col gap-20 sm:gap-32">
          <div className="flex flex-col items-start gap-6">
            <a
              href={hero.pill.href}
              className={cn(
                "inline-flex max-w-full items-center gap-x-3 rounded-full bg-olive-950/[0.05] px-3 py-0.5 text-sm/6 text-olive-950 hover:bg-olive-950/10 max-sm:flex-col max-sm:items-start max-sm:rounded-md max-sm:px-3.5 max-sm:py-2 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
                focusRing,
              )}
            >
              <span className="text-pretty">{hero.pill.text}</span>
              <span className="h-3 w-px bg-olive-950/20 max-sm:hidden dark:bg-white/20" aria-hidden="true" />
              <span className="inline-flex items-center gap-2 font-medium">
                {hero.pill.action} <Chevron />
              </span>
            </a>
            <h1 className="max-w-5xl font-serif text-5xl leading-[1] tracking-tight text-balance text-olive-950 sm:text-[5rem] sm:leading-[1.05] dark:text-white">
              {hero.title}
            </h1>
            <div className="max-w-3xl text-lg/8 text-olive-700 dark:text-olive-400">
              <p>{hero.body}</p>
            </div>
            <div className="flex items-center gap-3">
              <ButtonLink href={hero.primary.href} className="font-normal">{hero.primary.label}</ButtonLink>
              <ButtonLink href={hero.secondary.href} variant="ghost" className="font-normal">
                {hero.secondary.label}
              </ButtonLink>
            </div>
          </div>
          <GradientFrame gradient="green" inset="top" className="aspect-[4/5] rounded-2xl sm:aspect-[19/10]">
            <DashboardMock />
          </GradientFrame>
        </div>
      </Container>
    </section>
  );
}
