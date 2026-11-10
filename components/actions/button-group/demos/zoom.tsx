import { MinusIcon, PlusIcon } from "lucide-react"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/components/ui/button-group"

export default function Demo() {
  const [zoom, setZoom] = useState(100)

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 10))
  }

  return (
    <ButtonGroup>
      <Button
        variant="outline"
        size="icon"
        aria-label="Zoom out"
        onClick={handleZoomOut}
      >
        <MinusIcon  />
      </Button>
      <ButtonGroupText className="w-16 justify-center">{zoom}%</ButtonGroupText>
      <Button
        variant="outline"
        size="icon"
        aria-label="Zoom in"
        onClick={handleZoomIn}
      >
        <PlusIcon  />
      </Button>
    </ButtonGroup>
  )
}