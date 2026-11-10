import { useEffect, useRef } from "react";
import { CloudletToaster, useCloudletController } from "../index";

export default function Demo() {
  const controller = useCloudletController();
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!controller) return;
    controller.show({ title: "Backup complete", kind: "success", description: { kind: "text", text: "12 files synced to the cloud." } });
    const t = setTimeout(() => controller.show({ title: "Storage almost full", kind: "warning" }), 1500);
    return () => clearTimeout(t);
  }, [controller]);

  return (
    <div ref={stage} className="relative min-h-72 w-full max-w-md overflow-hidden rounded-xl border bg-card p-4">
      {controller && (
        <div className="flex flex-wrap gap-2">
          {(["info", "success", "warning", "error"] as const).map((kind) => (
            <button
              key={kind}
              className="rounded-md border bg-background px-3 py-1.5 text-sm capitalize hover:bg-accent"
              onClick={() => controller.show({ title: `${kind} notification`, kind })}
            >
              {kind}
            </button>
          ))}
        </div>
      )}
      {controller && <CloudletToaster controller={controller} position="top-center" />}
    </div>
  );
}
