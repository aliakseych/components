import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GitFork,
  Image,
  MoreHorizontal,
  Pin,
  QrCode,
  Star,
  ThumbsDown,
  ThumbsUp,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "../index";

const PILL = "first:rounded-l-full last:rounded-r-full";

export default function Demo() {
  return (
    <div className="flex w-full max-w-2xl flex-col items-start gap-4">
      <ButtonGroup>
        <Button className={PILL}>Merge pull request</Button>
        <ButtonGroupSeparator />
        <Button size="icon" className={PILL} aria-label="More merge options">
          <ChevronDown />
        </Button>
      </ButtonGroup>

      <div className="flex flex-wrap gap-3">
        <ButtonGroup>
          <Button variant="secondary" className={PILL}>
            <GitFork />
            Fork
            <span className="rounded-full bg-chart-2/15 px-1.5 text-xs tabular-nums text-chart-2">24</span>
          </Button>
          <ButtonGroupSeparator />
          <Button variant="secondary" size="icon" className={PILL} aria-label="Fork options">
            <ChevronDown />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="secondary" size="icon" className={PILL} aria-label="Show QR code">
            <QrCode />
          </Button>
          <ButtonGroupSeparator />
          <Button variant="secondary" className={PILL}>Scan to pay</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="secondary" className={PILL}>
            <ThumbsUp />
            2.4K
          </Button>
          <ButtonGroupSeparator />
          <Button variant="secondary" size="icon" className={PILL} aria-label="Dislike">
            <ThumbsDown />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="secondary" className={PILL}>
            <Star />
            Star
          </Button>
          <ButtonGroupSeparator />
          <Button variant="secondary" className={PILL}>
            <span className="text-xs tabular-nums text-chart-2">104</span>
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="secondary" className={PILL}>
            <Pin />
            Pinned
          </Button>
          <ButtonGroupSeparator />
          <Button variant="secondary" size="icon" className={PILL} aria-label="Pin options">
            <ChevronDown />
          </Button>
        </ButtonGroup>
      </div>

      <ButtonGroup>
        <Button variant="secondary" className={PILL}>
          <ChevronLeft />
          Previous
        </Button>
        <ButtonGroupSeparator />
        <Button variant="secondary" className={PILL}>
          Next
          <ChevronRight />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button variant="secondary" className={PILL}>
          <Image />
          Photos
        </Button>
        <ButtonGroupSeparator />
        <Button variant="secondary" className={PILL}>
          <Video />
          Videos
        </Button>
        <ButtonGroupSeparator />
        <Button variant="secondary" size="icon" className={PILL} aria-label="More media">
          <MoreHorizontal />
        </Button>
      </ButtonGroup>

      <ButtonGroup aria-label="Text alignment">
        {[
          { label: "Align left", icon: AlignLeft },
          { label: "Align center", icon: AlignCenter },
          { label: "Align right", icon: AlignRight },
          { label: "Justify", icon: AlignJustify },
        ].flatMap(({ label, icon: Icon }, index) => [
          index > 0 ? <ButtonGroupSeparator key={`separator-${label}`} /> : null,
          <Button key={label} variant="secondary" size="icon" className={PILL} aria-label={label}>
            <Icon />
          </Button>,
        ])}
      </ButtonGroup>
    </div>
  );
}
