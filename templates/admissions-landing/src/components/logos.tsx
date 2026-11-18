import { logos, type Logo } from "@/sample/content";
import { cn } from "@/lib/utils";
import { Container } from "./ui";

/** Typographic wordmarks for fictional schools; swap for real SVG logos you have rights to. */
function Wordmark({ logo }: { logo: Logo }) {
  const [first, ...rest] = logo.name.split(" ");
  switch (logo.style) {
    case "serif":
      return <span className="font-serif text-[2.4rem] leading-none tracking-tight sm:text-5xl">{logo.name}</span>;
    case "script":
      return <span className="font-serif text-[2.2rem] leading-none italic sm:text-[2.75rem]">{logo.name}</span>;
    case "sans-bold":
      return <span className="text-2xl leading-none font-extrabold tracking-tight uppercase sm:text-3xl">{logo.name}</span>;
    case "block":
      return <span className="text-[2.4rem] leading-none font-black tracking-[-0.08em] sm:text-5xl">{logo.name}</span>;
    case "stack":
      return (
        <span className="flex flex-col items-center font-serif leading-none tracking-[0.12em] uppercase">
          <span className="text-lg sm:text-xl">{first}</span>
          <span className="text-lg sm:text-xl">{rest.join(" ")}</span>
        </span>
      );
    case "serif-caps":
      return (
        <span className="flex flex-col items-center font-serif leading-none uppercase">
          <span className="text-base tracking-wide sm:text-xl">{logo.name}</span>
          <span className="mt-1 text-[0.55rem] tracking-[0.2em] sm:text-[0.65rem]">Founded 1868</span>
        </span>
      );
  }
}

export function Logos() {
  const track = [...logos.items, ...logos.items];
  return (
    <section className="py-16">
      <Container className="flex flex-col items-center gap-10">
        <p className="mx-auto max-w-3xl text-center font-serif text-[2rem] leading-[1.1] tracking-tight text-pretty text-olive-950 sm:text-4xl dark:text-white">
          {logos.heading}
        </p>
        <div className="landing-marquee-mask w-full overflow-hidden">
          <ul className="landing-marquee-track items-center">
            {track.map((logo, i) => {
              const clone = i >= logos.items.length;
              return (
                <li key={i} data-marquee-clone={clone || undefined} aria-hidden={clone || undefined} className="mx-7 shrink-0 sm:mx-10">
                  <a
                    href="#colleges"
                    tabIndex={clone ? -1 : undefined}
                    aria-label={logo.name}
                    className={cn(
                      "school-logo flex items-center rounded-sm whitespace-nowrap hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive-950 dark:!text-olive-100 dark:focus-visible:outline-white",
                      logo.size === "lg" ? "h-10 sm:h-12" : "h-7 sm:h-9",
                    )}
                    style={{ color: logo.color }}
                  >
                    <Wordmark logo={logo} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
