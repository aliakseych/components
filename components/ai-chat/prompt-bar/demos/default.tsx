import { PromptBar, midnightPreset } from "../index";

export default function Demo() {
  return (
    <div className="flex w-full justify-center rounded-2xl bg-[#07080d] p-4 sm:p-10">
      <PromptBar
        {...midnightPreset}
        placeholders={["Which exporters grew fastest this year?", "Compare cotton prices by month"]}
        efforts={["Fast", "Normal", "Deep"]}
        defaultEffort="Normal"
      />
    </div>
  );
}
