import { PlusIcon, SettingsIcon } from "lucide-react";
import { Button } from "../index";

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button>
        <PlusIcon />
        New project
      </Button>
      <Button aria-label="Settings" size="icon" variant="outline">
        <SettingsIcon />
      </Button>
    </div>
  );
}
