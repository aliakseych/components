import { MinusIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

export default function Demo() {
  return (
    <ButtonGroup orientation="vertical">
      <Button variant="outline" size="icon" aria-label="Add">
        <PlusIcon  />
      </Button>
      <Button variant="outline" size="icon" aria-label="Subtract">
        <MinusIcon  />
      </Button>
    </ButtonGroup>
  )
}