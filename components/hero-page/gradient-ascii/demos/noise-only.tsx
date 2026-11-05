import { NoiseBackground } from "../index";

export default function Demo() {
  return (
    <div className="h-96 w-full bg-[#07080d]">
      <NoiseBackground cellSize={16} speed={0.6} intro={false} />
    </div>
  );
}
