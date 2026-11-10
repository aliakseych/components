import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

export default function Demo() {
  return (
    <Button variant="outline" aria-label="Search (Command K)">
      <SearchIcon  />
      <span>Search</span>
      <KbdGroup aria-hidden="true">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </Button>
  )
}