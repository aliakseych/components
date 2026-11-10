import { MenuIcon, XIcon } from "lucide-react"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function Demo() {
  const [open, setOpen] = useState(false)

  return (
    <Button
      size="icon"
      variant="outline"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
    >
      <span className="relative flex size-4 items-center justify-center">
        <MenuIcon  />
        <XIcon  />
      </span>
    </Button>
  )
}