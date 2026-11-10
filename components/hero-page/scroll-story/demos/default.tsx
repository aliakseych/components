import { ScrollStory } from "../index";
import { LIFE_CAPTIONS } from "../life-data";
import { TOAST_PLATEAUS, ToastStage, ToastStill } from "../toast-scene";

export default function Demo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollStory
        title="Life of a notification"
        lead="One toast, from a soft landing to a promise kept."
        steps={LIFE_CAPTIONS}
        stage={(props) => <ToastStage {...props} />}
        still={(index) => <ToastStill state={TOAST_PLATEAUS[index]!} />}
      />
      <div className="h-[60vh]" />
    </div>
  );
}
