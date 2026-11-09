"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { readNavStack } from "@/components/nav-depth";

// «Назад» = на реальный предыдущий экран. Если пришли по прямой ссылке (истории внутри
// приложения нет) — на запасной адрес, чтобы не выкинуть человека с сайта.
export function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Назад"
      onClick={() => {
        if (readNavStack().length > 1) router.back();
        else router.push(fallback);
      }}
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card"
    >
      <ChevronLeft className="size-6" />
    </button>
  );
}
