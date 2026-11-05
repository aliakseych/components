"use client";

import NumberFlow from "@number-flow/react";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PricingFrequency = "monthly" | "yearly";

export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  /** A number renders as a price; a string renders as written. */
  price: Record<PricingFrequency, number | string>;
  features: string[];
  cta: string;
  onSelect?: () => void;
  popular?: boolean;
};

export type PricingTiersProps = {
  plans: PricingPlan[];
  frequency?: PricingFrequency;
  currency?: string;
  popularLabel?: string;
  className?: string;
};

/** Only the plan cards. Add your own heading and billing toggle around them. */
export const PricingTiers = ({
  plans,
  frequency = "monthly",
  currency = "USD",
  popularLabel = "Popular",
  className,
}: PricingTiersProps) => (
  <div className={cn("@container w-full", className)}>
    <div className="grid w-full @2xl:grid-cols-3 gap-4">
      {plans.map((plan) => {
        const price = plan.price[frequency];

        return (
          <Card
            className={cn(
              "relative w-full text-left",
              plan.popular && "ring-2 ring-primary"
            )}
            key={plan.id}
          >
            {plan.popular && (
              <Badge className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 rounded-full">
                {popularLabel}
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="font-medium text-xl">{plan.name}</CardTitle>
              <CardDescription>
                <p>{plan.description}</p>
                {typeof price === "number" ? (
                  <NumberFlow
                    className="font-medium text-foreground tabular-nums"
                    format={{
                      style: "currency",
                      currency,
                      maximumFractionDigits: 0,
                    }}
                    suffix={`/month, billed ${frequency}.`}
                    value={price}
                  />
                ) : (
                  <span className="font-medium text-foreground">{price}.</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {plan.features.map((feature) => (
                <div
                  className="flex gap-2 text-muted-foreground text-sm"
                  key={feature}
                >
                  <BadgeCheck className="h-[1lh] w-4 flex-none" />
                  {feature}
                </div>
              ))}
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                className="w-full"
                onClick={plan.onSelect}
                variant={plan.popular ? "default" : "secondary"}
              >
                {plan.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  </div>
);
