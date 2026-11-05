import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  description: string;
  items?: string[];
  image?: string;
  button?: {
    url: string;
    text: string;
  };
};

export type ChangelogProps = {
  entries: ChangelogEntry[];
  title?: string;
  description?: string;
  className?: string;
};

export const Changelog = ({
  entries,
  title = "Changelog",
  description,
  className,
}: ChangelogProps) => (
  <section className={cn("w-full py-16", className)}>
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-semibold text-2xl tracking-tight md:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mb-6 text-base text-muted-foreground md:text-lg">
          {description}
        </p>
      )}
    </div>
    <div className="mx-auto mt-12 max-w-3xl space-y-16 md:space-y-24">
      {entries.map((entry) => (
        <div
          className="relative flex flex-col gap-4 md:flex-row md:gap-16"
          key={`${entry.version}-${entry.date}`}
        >
          <div className="top-8 flex h-min shrink-0 items-center gap-4 md:sticky md:w-64">
            <Badge className="font-mono text-xs tabular-nums" variant="outline">
              {entry.version}
            </Badge>
            <span className="text-muted-foreground text-xs tabular-nums">
              {entry.date}
            </span>
          </div>
          <div className="flex flex-col">
            <h2 className="mb-3 font-medium text-foreground text-lg leading-tight">
              {entry.title}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              {entry.description}
            </p>
            {entry.items && entry.items.length > 0 && (
              <ul className="mt-4 ml-4 space-y-1.5 text-muted-foreground text-sm md:text-base">
                {entry.items.map((item) => (
                  <li className="list-disc" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {entry.image && (
              <img
                alt={`${entry.version} visual`}
                className="mt-8 w-full rounded-xl border object-cover"
                src={entry.image}
              />
            )}
            {entry.button && (
              <Button asChild className="mt-4 self-end" variant="link">
                <a href={entry.button.url} rel="noreferrer" target="_blank">
                  {entry.button.text} <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  </section>
);
