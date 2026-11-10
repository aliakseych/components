import { LayoutGridIcon, ListIcon, TableIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

export default function Demo() {
  return (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Grid view">
        <LayoutGridIcon  />
      </Button>
      <Button variant="outline" size="icon" aria-label="List view">
        <ListIcon  />
      </Button>
      <Button variant="outline" size="icon" aria-label="Table view">
        <TableIcon  />
      </Button>
    </ButtonGroup>
  )
}