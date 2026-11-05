import { PromptBar, midnightPreset } from "../index";

export default function Demo() {
  return (
    <div className="flex w-full justify-center rounded-2xl bg-[#07080d] p-4 sm:p-10">
      <PromptBar
        {...midnightPreset}
        busy
        busyPlaceholder="Working…"
        efforts={["Fast", "Normal", "Deep"]}
      />
    </div>
  );
}
