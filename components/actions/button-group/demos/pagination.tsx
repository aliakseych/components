import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

export default function Demo() {
  return (
    <ButtonGroup>
      <Button variant="outline" size="sm">
        <ArrowLeftIcon  />
        Previous
      </Button>
      <Button variant="outline" size="sm">
        1
      </Button>
      <Button variant="outline" size="sm">
        2
      </Button>
      <Button variant="outline" size="sm">
        3
      </Button>
      <Button variant="outline" size="sm">
        Next
        <ArrowRightIcon  />
      </Button>
    </ButtonGroup>
  )
}