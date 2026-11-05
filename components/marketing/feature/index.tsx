"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export type FeatureItem = {
  id: string;
  title: string;
  image: string;
  description: string;
};

export type FeatureProps = {
  features: FeatureItem[];
  title?: string;
  className?: string;
};

export const Feature = ({
  features,
  title = "Features",
  className,
}: FeatureProps) => {
  const [activeId, setActiveId] = useState(features[0]?.id);

  return (
    <section className={cn("w-full py-16", className)}>
      <h2 className="mb-8 font-semibold text-2xl tracking-tight md:text-3xl">{title}</h2>
      <div className="flex w-full items-start justify-between gap-12">
        <div className="w-full md:w-1/2">
          <Accordion
            className="w-full"
            collapsible
            defaultValue={features[0]?.id}
            type="single"
          >
            {features.map((feature) => (
              <AccordionItem
                className="transition-opacity hover:opacity-80"
                key={feature.id}
                value={feature.id}
              >
                <AccordionTrigger
                  className="cursor-pointer py-5 no-underline! transition"
                  onClick={() => setActiveId(feature.id)}
                >
                  <span
                    className={cn(
                      "font-medium text-base",
                      feature.id === activeId
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {feature.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <p className="text-base text-muted-foreground">
                    {feature.description}
                  </p>
                  <img
                    alt=""
                    className="mt-4 h-full max-h-80 w-full rounded-md object-cover md:hidden"
                    src={feature.image}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="relative hidden w-1/2 overflow-hidden rounded-xl border bg-card shadow-xs md:block">
          <div className="relative aspect-[4/3]">
            {features.map((feature) => (
              <img
                alt={feature.id === activeId ? feature.title : ""}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                  feature.id === activeId ? "opacity-100" : "opacity-0"
                )}
                key={feature.id}
                src={feature.image}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
