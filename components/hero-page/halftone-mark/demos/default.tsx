import { HalftoneMark } from "../index";
import mark from "./sample-mark.svg";

export default function Demo() {
  return (
    <div className="size-40">
      <HalftoneMark src={mark} label="Sample logo" />
    </div>
  );
}
