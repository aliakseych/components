"use client";

import { useCountUp } from "@/lib/motion";

/** Big figure that counts up from 0 on first show. */
export function CountUp({ value, format }: { value: number | string; format: (value: number) => string }) {
  const target = Number(value) || 0;
  const shown = useCountUp(target);
  return <>{format(shown === target ? target : Math.round(shown))}</>;
}
