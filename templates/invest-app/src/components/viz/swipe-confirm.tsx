"use client";

import { useRef, useState } from "react";
import { ChevronsRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// «Потяните, чтобы …»: подтверждение действия с деньгами жестом. onConfirm вызывается,
// когда ручку дотянули до конца; пока промис не завершён, показывается загрузка.
export function SwipeConfirm({
  label,
  onConfirm,
  disabled,
  className,
}: {
  label: string;
  onConfirm: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const start = useRef(0);
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [width, setWidth] = useState(0);
  const KNOB = 56;
  const max = Math.max(0, width - KNOB - 8);

  async function release() {
    setDrag(false);
    if (max && x >= max * 0.9 && !busy) {
      setX(max);
      setBusy(true);
      try {
        await onConfirm();
      } finally {
        setBusy(false);
        setX(0);
      }
    } else setX(0);
  }

  const off = disabled || busy;
  const progress = max ? x / max : 0;
  return (
    <div
      ref={track}
      className={cn(
        "relative h-16 w-full touch-none select-none overflow-hidden rounded-full p-1 transition-colors",
        off && !busy ? "bg-muted" : "bg-primary",
        className,
      )}
    >
      <div
        className="absolute inset-y-1 left-1 rounded-full bg-lime"
        style={{ width: x + KNOB, transition: drag ? "none" : "width .3s" }}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center pl-12 text-base font-semibold",
          off && !busy ? "text-muted-foreground" : "text-primary-foreground",
        )}
        style={{ opacity: 1 - progress }}
      >
        {label}
      </span>
      <button
        type="button"
        aria-label={label}
        disabled={off}
        onPointerDown={(e) => {
          if (off) return;
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          setWidth(track.current?.offsetWidth ?? 0);
          start.current = e.clientX - x;
          setDrag(true);
        }}
        onPointerMove={(e) => drag && setX(Math.max(0, Math.min(max, e.clientX - start.current)))}
        onPointerUp={release}
        // Жест прервала система (скролл, звонок) — это не согласие: только сброс.
        onPointerCancel={() => {
          setDrag(false);
          setX(0);
        }}
        onKeyDown={async (e) => {
          if ((e.key === "Enter" || e.key === " ") && !off) {
            e.preventDefault();
            setBusy(true);
            try {
              await onConfirm();
            } finally {
              setBusy(false);
            }
          }
        }}
        className="relative z-10 flex size-14 items-center justify-center rounded-full bg-white text-primary shadow-md disabled:opacity-60"
        style={{ transform: `translateX(${x}px)`, transition: drag ? "none" : "transform .3s" }}
      >
        {busy ? <Loader2 className="size-6 animate-spin" /> : <ChevronsRight className="size-6" />}
      </button>
    </div>
  );
}
