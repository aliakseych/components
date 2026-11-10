import { ChapterRail } from "../index";

const CHAPTERS = [
  { id: "cr-intro", label: "Intro" },
  { id: "cr-how", label: "How it works" },
  { id: "cr-details", label: "Details" },
  { id: "cr-start", label: "Get started" },
  { id: "cr-faq", label: "FAQ" },
];

export default function Demo() {
  return (
    <div>
      <ChapterRail chapters={CHAPTERS} hideBeforeId="cr-end" />
      {CHAPTERS.map(({ id, label }) => (
        <section key={id} id={id} className="mx-auto flex min-h-[80vh] max-w-3xl flex-col justify-center gap-3 px-6">
          <h2 className="text-3xl font-semibold tracking-tight">{label}</h2>
          <p className="text-muted-foreground">Scroll: the dot rail on the right edge (from 1280px wide) follows the chapter and fills as you read.</p>
        </section>
      ))}
      <footer id="cr-end" className="mx-auto max-w-3xl px-6 py-24 text-sm text-muted-foreground">Footer: the rail fades out here.</footer>
    </div>
  );
}
