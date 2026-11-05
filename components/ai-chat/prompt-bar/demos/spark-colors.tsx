import { useState } from "react";
import { PromptBar, midnightPreset } from "../index";

const colors = [
  { name: "Blue", value: "#7fb2ff" },
  { name: "Violet", value: "#b39dff" },
  { name: "Green", value: "#5fd39a" },
  { name: "Amber", value: "#f5b84a" },
];

export default function Demo() {
  const [color, setColor] = useState(colors[0].value);

  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-2xl bg-[#07080d] p-4 sm:p-10">
      <PromptBar
        {...midnightPreset}
        defaultEffort="Deep"
        efforts={["Fast", "Normal", "Deep"]}
        placeholder="Particles use the color you choose"
        sparkColor={color}
      />
      <div aria-label="Particle color" className="flex gap-2" role="radiogroup">
        {colors.map((option) => (
          <button
            aria-checked={option.value === color}
            aria-label={option.name}
            className="size-8 rounded-md outline-offset-2 aria-checked:outline-2 aria-checked:outline-white"
            key={option.value}
            onClick={() => setColor(option.value)}
            role="radio"
            style={{ backgroundColor: option.value }}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
