"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AiChat } from "@/components/ai/ai-chat";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { askAiEvent, type AskAiDetail } from "@/lib/ask-ai";
import { cn } from "@/lib/utils";

export function AiFab() {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(() => searchParams.get("ai") === "open");
  const [queue, setQueue] = useState<(AskAiDetail & { page: string })[]>([]);
  const [viewport, setViewport] = useState<{ height: number; bottom: number } | null>(null);
  useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<AskAiDetail>).detail;
      if (!detail?.question?.trim()) return;
      setQueue((current) => [...current, { ...detail, page: pathname }]);
      setOpen(true);
    };
    window.addEventListener(askAiEvent(), handle);
    return () => window.removeEventListener(askAiEvent(), handle);
  }, [pathname]);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv || !open) return;
    const update = () => setViewport({ height: vv.height, bottom: Math.max(0, window.innerHeight - vv.height - vv.offsetTop) });
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => { vv.removeEventListener("resize", update); vv.removeEventListener("scroll", update); };
  }, [open]);
  const hidden = ["/login", "/register", "/onboarding", "/offline"].some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (hidden) return null;
  const onDealPage = /^\/deals\/\d+\/?$/.test(pathname);
  return (
    <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
      <div className={cn("pointer-events-none fixed inset-x-0 z-40 mx-auto max-w-md", onDealPage ? "bottom-[176px]" : "bottom-[104px]")}>
        <button type="button" onClick={() => setOpen(true)} aria-label="Открыть ИИ-помощника" className="glass pointer-events-auto ml-auto mr-4 flex size-14 items-center justify-center rounded-full"><span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground"><Sparkles className="size-5" /></span></button>
      </div>
      {/* Шторка и чат — одна поверхность (bg-background), ручка сверху с воздухом. */}
      <DrawerContent aria-describedby={undefined} style={viewport ? { height: viewport.height * 0.92, maxHeight: viewport.height * 0.92, bottom: viewport.bottom } : undefined} className="mx-auto h-[92dvh] max-h-[92dvh] max-w-md overflow-hidden rounded-t-[28px] bg-background pt-2 data-[vaul-drawer-direction=bottom]:max-h-[92dvh] data-[vaul-drawer-direction=bottom]:rounded-t-[28px]">
        <DrawerTitle className="sr-only">ИИ-помощник</DrawerTitle>
        <AiChat onDealClick={() => setOpen(false)} queuedQuestion={queue[0]} onQuestionConsumed={() => setQueue((current) => current.slice(1))} />
      </DrawerContent>
    </Drawer>
  );
}
