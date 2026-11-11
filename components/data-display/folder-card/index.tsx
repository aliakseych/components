import {
  Children,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Eye, type LucideProps } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type FolderCardProps = {
  title: string;
  /** Lucide icon (or any component accepting className). */
  icon: ComponentType<LucideProps>;
  /** View count shown next to the eye icon. */
  views?: number;
  /** Image URL (alpha PNG/WebP). Rendered as a tinted, faded mask in the top-right corner. */
  watermark?: string;
  /** Renders the card as a link. */
  href?: string;
  /** Renders the card as a button when no href is given. */
  onClick?: () => void;
  className?: string;
};

const nf = new Intl.NumberFormat("en-US");

export function FolderCard({
  title,
  icon: Icon,
  views,
  watermark,
  href,
  onClick,
  className,
}: FolderCardProps) {
  const cls = cn(
    "group relative block h-44 w-full text-left outline-none",
    "motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out",
    "hover:-translate-y-0.5 focus-visible:-translate-y-0.5",
    "rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className,
  );

  const body = (
    <>
      {/* back of the folder: tab + body */}
      <span aria-hidden className="absolute left-0 top-0 h-5 w-28 rounded-t-xl bg-primary/15" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 top-5 rounded-xl rounded-tl-none bg-primary/15" />
      {/* second sheet peeking out at the top right */}
      <span
        aria-hidden
        className={cn(
          "absolute right-5 top-3 h-16 w-2/5 rounded-t-lg border border-primary/20 bg-card",
          "motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out",
          "group-hover:-translate-y-2 group-focus-visible:-translate-y-2",
        )}
      />
      {/* front sheet */}
      <span
        className={cn(
          "absolute inset-x-0 bottom-0 top-9 flex flex-col justify-between overflow-hidden rounded-xl border border-primary/25 border-b-2 border-b-primary/40 bg-card p-4 shadow-sm",
          "motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out",
          "group-hover:-translate-y-2 group-focus-visible:-translate-y-2",
        )}
      >
        {watermark ? (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute -right-8 -top-8 size-44 opacity-[0.12]",
              "motion-safe:transition-[transform,opacity] motion-safe:duration-300",
              "group-hover:opacity-[0.17] group-focus-visible:opacity-[0.17]",
              "motion-safe:group-hover:-rotate-4 motion-safe:group-focus-visible:-rotate-4",
              "[mask-image:radial-gradient(circle_at_70%_30%,#000_25%,transparent_72%)]",
            )}
          >
            <span
              className="block size-full bg-foreground"
              style={
                {
                  maskImage: `url(${watermark})`,
                  WebkitMaskImage: `url(${watermark})`,
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                } as CSSProperties
              }
            />
          </span>
        ) : null}

        <span className="relative flex items-start justify-between">
          <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary">
            <Icon aria-hidden className="size-6 fill-primary/20" strokeWidth={1.6} />
          </span>
          {views !== undefined ? (
            <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
              <Eye aria-hidden className="size-3.5" />
              <span className="sr-only">Views: </span>
              {nf.format(views)}
            </span>
          ) : null}
        </span>
        <span className="relative line-clamp-2 text-base font-bold leading-snug text-foreground">
          {title}
        </span>
      </span>
    </>
  );

  return href ? (
    <a href={href} className={cls}>
      {body}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

export type FolderCardGridProps = {
  children: ReactNode;
  className?: string;
};

/** Responsive grid whose cards fade up one after another when scrolled into view. */
export function FolderCardGrid({ children, className }: FolderCardGridProps) {
  const reduce = useReducedMotion();
  return (
    <motion.ul
      className={cn("grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ staggerChildren: reduce ? 0 : 0.07 }}
    >
      {Children.map(children, (child) => (
        <motion.li
          variants={{
            hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.4, ease: "easeOut" } },
          }}
        >
          {child}
        </motion.li>
      ))}
    </motion.ul>
  );
}
