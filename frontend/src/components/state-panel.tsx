import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function StatePanel({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode
  tone?: "muted" | "error"
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm",
        tone === "error" ? "text-accent" : "text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}
