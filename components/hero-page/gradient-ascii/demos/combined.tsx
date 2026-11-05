import { GradientASCII } from "../index";

export default function Demo() {
  return (
    <div className="h-96 w-full bg-[#07080d]">
      <GradientASCII cellSize={16} speed={0.6} clickEffect="none" intro={false} />
    </div>
  );
}
