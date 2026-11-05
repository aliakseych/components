import { UsersIcon, XIcon } from "lucide-react";
import { Pill, PillButton, PillDelta, PillIcon, PillIndicator, PillStatus } from "../index";

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Pill>Default</Pill>
      <Pill>
        <PillIndicator pulse variant="success" />
        Live
      </Pill>
      <Pill>
        <PillStatus>
          <PillIndicator variant="warning" />
          Build
        </PillStatus>
        Pending
      </Pill>
      <Pill>
        <PillDelta delta={4} />
        4% this week
      </Pill>
      <Pill>
        <PillIcon icon={UsersIcon} />
        12 members
      </Pill>
      <Pill>
        Design
        <PillButton aria-label="Remove Design">
          <XIcon className="size-3" />
        </PillButton>
      </Pill>
    </div>
  );
}
