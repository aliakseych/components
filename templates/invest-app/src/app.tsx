// App shell: what app/layout.tsx did in the Next.js version, plus the router and config.
import { Suspense, useState } from "react";
import { MotionConfig } from "motion/react";
import { DUR, EASE_OUT } from "@/lib/motion";
import { AiFab } from "@/components/ai/ai-fab";
import { NavDepth } from "@/components/nav-depth";
import { TabBar } from "@/components/tab-bar";
import { Toaster } from "@/components/ui/sonner";
import { NotFoundPage, routes } from "@/routes";
import { RouterProvider, Routes, type RouterMode } from "@/shims/router";
import { setConfig, type InvestAppConfig, type Brand } from "@/template.config";

export interface InvestAppProps {
  mode?: RouterMode;
  /** First path in memory mode, e.g. "/deals/2". */
  initialPath?: string;
  config?: Partial<InvestAppConfig> & { brand?: Partial<Brand> };
}

export function InvestApp({ mode = "history", initialPath = "/", config }: InvestAppProps) {
  // Config is read by plain functions (money format, brand), so it is set before the first render.
  useState(() => setConfig(config ?? {}));

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DUR.base, ease: EASE_OUT }}>
    <RouterProvider initialPath={initialPath} mode={mode}>
      {/* The app column is an inner container, not body: drawer scroll locks rewrite body padding. */}
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background font-sans text-foreground antialiased">
        <Routes notFound={NotFoundPage} routes={routes} />
      </div>
      <Suspense>
        <NavDepth />
        <TabBar />
      </Suspense>
      <Suspense>
        <AiFab />
      </Suspense>
      <Toaster position="top-center" />
    </RouterProvider>
    </MotionConfig>
  );
}
