import { useRef, type ReactNode } from "react";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { gsap, useGsap } from "@/lib/motion";

export type BlogProps = {
  title: string;
  sub: string;
  more: string;
  posts: { title: string; date: string; href: string; image: ReactNode }[];
};

export function Blog({ title, sub, more, posts }: BlogProps) {
  const ref = useRef<HTMLElement>(null);
  useGsap(ref, () => {
    gsap.from("[data-blog-copy]", { y: 48, autoAlpha: 0, duration: 1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 78%", once: true } });
  });
  return (
    <section id="blog" ref={ref} className="scroll-mt-24 bg-cream py-24">
      <div className="container-own flex flex-col items-center gap-16">
        <div data-blog-copy className="text-center">
          <h2 className="font-display text-[40px] tracking-[-1.12px] text-fg sm:text-[56px] sm:leading-[60.5px]">{title}</h2>
          <p className="pt-4 text-xl leading-[30px] font-medium text-fg">{sub}</p>
        </div>
        <div data-blog-copy className="grid w-full gap-8 lg:grid-cols-3">
          {posts.map((p) => (
            <a key={p.title} href={p.href} className="group flex flex-col gap-6 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep dark:focus-visible:outline-sky">
              <div className="h-60 w-full overflow-hidden">{p.image}</div>
              <div>
                <h3 className="flex items-start justify-between gap-4 text-2xl leading-8 font-semibold text-fg">
                  {p.title}
                  <ArrowUpRight aria-hidden className="mt-1 size-6 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="pt-4 text-base text-muted">{p.date}</p>
              </div>
            </a>
          ))}
        </div>
        <a data-blog-copy href="#blog" className="inline-flex items-center gap-2.5 rounded-full bg-smoke px-[26px] py-[14px] text-lg text-white transition-[scale] duration-300 outline-none hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep dark:bg-white dark:text-ink">
          {more}
          <ChevronRight aria-hidden className="size-5" />
        </a>
      </div>
    </section>
  );
}
