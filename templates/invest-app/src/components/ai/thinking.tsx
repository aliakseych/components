"use client";

import LatticeLoader from "@/components/bits/LatticeLoader";
import ThoughtLine from "@/components/bits/ThoughtLine";

export function Thinking({ working, elapsed }: { working: boolean; elapsed?: number }) {
  return (
    <div className="ml-10 py-2">
      <ThoughtLine
        working={working}
        elapsed={working ? undefined : elapsed}
        label="Думаю…"
        doneLabel="Думал"
        showTimer
        glyph={<LatticeLoader status={working ? "working" : "done"} label="" doneLabel="" errorLabel="" showTimer={false} cellSize={4} gap={2} color="var(--accent)" doneColor="var(--lime)" glow glowColor="var(--accent)" />}
        glyphStatic
        color="var(--muted-foreground)"
        fontSize={14}
        collapsible={false}
      />
    </div>
  );
}
