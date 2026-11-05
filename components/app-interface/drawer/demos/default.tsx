import { CopyIcon, FileTextIcon, GlobeIcon, LockIcon, Share2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "../index";

export function ShareDrawer({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <div className="flex w-full max-w-xl items-center gap-3 rounded-xl border bg-card p-4 shadow-xs">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border text-muted-foreground">
        <FileTextIcon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">Q3 revenue report</p>
        <p className="truncate text-xs text-muted-foreground">Edited 2 hr. ago</p>
      </div>
      <Drawer defaultOpen={defaultOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm"><Share2Icon /> Share</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader>
              <DrawerTitle>Share this report</DrawerTitle>
              <DrawerDescription>Anyone with the link can view it.</DrawerDescription>
            </DrawerHeader>
            <ul className="mx-5 divide-y border-y text-sm">
              <li className="flex items-center gap-3 py-2.5">
                <GlobeIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate font-medium">Public link</span>
                <span className="text-muted-foreground">Can view</span>
              </li>
              <li className="flex items-center gap-3 py-2.5">
                <LockIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate font-medium">Finance team</span>
                <span className="text-muted-foreground">Can edit</span>
              </li>
            </ul>
            <p className="mx-5 my-4 truncate rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground">
              acme.example/r/q3-revenue-8f2c
            </p>
            <DrawerFooter>
              <Button><CopyIcon /> Copy link</Button>
              <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default function Demo() {
  return <ShareDrawer />;
}
