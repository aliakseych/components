import Link from "next/link";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Empty({ title, action }: { title: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[28px] bg-card p-8 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground"><Inbox className="size-9" /></div>
      <p className="text-lg font-semibold">{title}</p>
      {action && <Button asChild className="h-11 rounded-full px-6"><Link href={action.href}>{action.label}</Link></Button>}
    </div>
  );
}
