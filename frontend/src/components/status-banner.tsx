import { AlertCircle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

export function StatusBanner({
  message,
  variant,
}: {
  message: string
  variant: "error" | "notice"
}) {
  const Icon = variant === "error" ? AlertCircle : Info

  return (
    <div
      className={cn(
        "mb-6 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm text-foreground",
        variant === "error"
          ? "border-accent/40 bg-accent/10"
          : "border-primary/40 bg-primary/10"
      )}
      role="status"
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          variant === "error" ? "text-accent" : "text-primary"
        )}
        aria-hidden
      />
      <span className="font-medium">{message}</span>
    </div>
  )
}
