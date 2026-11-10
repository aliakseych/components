import { CreditCardIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Demo() {
  return (
    <Button
      variant="outline"
      className="group/button h-auto justify-start gap-3 px-4 py-3 text-left"
    >
      <div className="bg-muted text-accent-foreground group-hover/button:bg-background rounded-md flex size-10 items-center justify-center">
        <CreditCardIcon  />
      </div>
      <div className="flex flex-col gap-0.5">
        <span>Credit Card</span>
        <span className="text-muted-foreground text-xs font-normal">
          Pay securely with your Visa or Mastercard
        </span>
      </div>
    </Button>
  )
}