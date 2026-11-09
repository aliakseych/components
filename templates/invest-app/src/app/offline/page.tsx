"use client";

import { CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-card">
        <CloudOff className="size-12" />
      </div>
      <h1 className="text-3xl font-semibold">Нет сети</h1>
      <Button className="h-14 w-full rounded-full text-base" onClick={() => window.location.reload()}>
        Обновить
      </Button>
    </main>
  );
}
