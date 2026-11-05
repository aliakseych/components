import { Button } from "@/components/ui/button";
import { ButtonGroup } from "../index";

export default function Demo() {
  return (
    <ButtonGroup>
      <Button variant="outline">Previous</Button>
      <Button variant="outline">Today</Button>
      <Button variant="outline">Next</Button>
    </ButtonGroup>
  );
}
