import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Demo() {
  return (
    <ButtonGroup className="**:data-[slot=button]:border-x-0">
      <Button variant="default">Save</Button>
      <ButtonGroupSeparator className="bg-primary-foreground/10" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="icon" aria-label="More options">
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>Save and publish</DropdownMenuItem>
          <DropdownMenuItem>Save as draft</DropdownMenuItem>
          <DropdownMenuItem>Save and exit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}