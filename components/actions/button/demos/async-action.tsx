import { CheckIcon, Loader2Icon } from "lucide-react"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"


type Status = "idle" | "loading" | "success"

export default function Demo() {
  const [status, setStatus] = useState<Status>("idle")

  useEffect(() => {
    if (status !== "success") return

    const timer = setTimeout(() => setStatus("idle"), 2000)
    return () => clearTimeout(timer)
  }, [status])

  return (
    <Button
      onClick={() => {
        if (status !== "idle") return

        setStatus("loading")
        setTimeout(() => setStatus("success"), 900)
      }}
      disabled={status === "loading"}
      aria-busy={status === "loading"}
      aria-live="polite"
      className="min-w-32"
    >
      {status === "loading" ? (
        <>
          <Loader2Icon className="animate-spin" aria-hidden="true" />
          Saving…
        </>
      ) : status === "success" ? (
        <>
          <CheckIcon  />
          Saved
        </>
      ) : (
        "Save changes"
      )}
    </Button>
  )
}