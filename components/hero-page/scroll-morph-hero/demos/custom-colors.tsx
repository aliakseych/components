import { ScrollMorphHero, type ScrollMorphItem } from "../index";

const items: ScrollMorphItem[] = Array.from({ length: 20 }, (_, index) => ({
  label: `Project ${index + 1}`,
}));

export default function Demo() {
  return (
    <div className="w-full bg-background">
      <ScrollMorphHero
        items={items}
        progress={1}
        endTitle="Everything in one view."
        stageHeight="calc(100svh - 4rem)"
        style={{ height: "calc(100svh - 4rem)" }}
        colors={{ text: "var(--primary)", muted: "var(--chart-2)", border: "var(--chart-1)" }}
      />
    </div>
  );
}
