import { ScrollMorphHero, type ScrollMorphItem } from "../index";

const items: ScrollMorphItem[] = Array.from({ length: 20 }, (_, index) => ({
  label: `Project ${index + 1}`,
}));

// The hero scrolls inside its own frame, so the demo stays one screen tall.
// The page background lives here, because the hero paints none.
export default function Demo() {
  return (
    <div
      className="h-[calc(100svh-4rem)] w-full overflow-y-auto bg-background"
      tabIndex={0}
      role="region"
      aria-label="Scrollable hero demo"
    >
      <ScrollMorphHero items={items} endTitle="Everything in one view." stageHeight="calc(100svh - 4rem)" />
    </div>
  );
}
