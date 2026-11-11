import { ChapterRail } from "../index";
import { ScrollStory } from "../story";
import { LIFE_CAPTIONS } from "../life-data";
import { TOAST_PLATEAUS, ToastStage, ToastStill } from "../toast-scene";

const CHAPTERS = [
  { id: "cs-intro", label: "Intro" },
  { id: "cs-story", label: "Life of a notification" },
  { id: "cs-end", label: "Wrap up" },
];

/** The rail over a pinned scroll story: the story is one chapter, the dot fills as it plays. */
export default function Demo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ChapterRail chapters={CHAPTERS} />
      <section id="cs-intro" className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center gap-3 px-6">
        <h2 className="text-3xl font-semibold tracking-tight">Intro</h2>
        <p className="text-muted-foreground">Scroll: the story below pins and scrubs while the rail tracks it.</p>
      </section>
      <ScrollStory
        id="cs-story"
        title="Life of a notification"
        lead="One toast, from a soft landing to a promise kept."
        steps={LIFE_CAPTIONS}
        stage={(props) => <ToastStage {...props} />}
        still={(index) => <ToastStill state={TOAST_PLATEAUS[index]!} />}
      />
      <section id="cs-end" className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center gap-3 px-6">
        <h2 className="text-3xl font-semibold tracking-tight">Wrap up</h2>
        <p className="text-muted-foreground">Back to plain sections.</p>
      </section>
    </div>
  );
}
