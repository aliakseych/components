import { CheckIcon, CopyIcon } from "lucide-react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Demo() {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (!isCopied) return
    const timer = setTimeout(() => setIsCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [isCopied])

  const copyToClipboard = (text: string) => {
    void navigator.clipboard?.writeText(text)
    setIsCopied(true)
  }

  return (
    <Button
      variant="outline"
      aria-label={isCopied ? "Copied" : "Copy"}
      onClick={() => copyToClipboard("https://example.com")}
    >
      {isCopied ? (
        <CheckIcon  />
      ) : (
        <CopyIcon  />
      )}
      <span>{isCopied ? "Copied" : "Copy"}</span>
    </Button>
  )
}