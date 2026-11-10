import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Demo() {
  return (
    <Button className="group/sliding relative overflow-hidden rounded-full px-6">
      <span className="inline-flex items-center transition-transform duration-300 group-hover/sliding:-translate-x-2">
        Get Started
      </span>
      <ArrowRightIcon className="absolute right-2.5 translate-x-8 opacity-0 transition-all duration-300 group-hover/sliding:translate-x-0 group-hover/sliding:opacity-100" />
    </Button>
  )
}