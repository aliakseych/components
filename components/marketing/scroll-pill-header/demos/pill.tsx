import { ScrollPillHeader } from "../index";

export default function Demo() {
  return (
    <div className="h-[200px] w-full bg-gradient-to-b from-slate-900 to-sky-700">
      <ScrollPillHeader forceShown onDark />
    </div>
  );
}
