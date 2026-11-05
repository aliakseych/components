import { Loader2Icon } from "lucide-react";
import { Button } from "../index";

export default function Demo() {
  return (
    <Button disabled>
      <Loader2Icon className="animate-spin" />
      Saving…
    </Button>
  );
}
