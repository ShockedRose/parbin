import { AlertCircle, Info } from "lucide-react"

export function StatusBanner({
  message,
  variant,
}: {
  message: string
  variant: "error" | "notice"
}) {
  const tone =
    variant === "error"
      ? "border-accent/50 bg-accent/10 text-accent"
      : "border-primary/55 bg-primary/10 text-primary"

  const Icon = variant === "error" ? AlertCircle : Info

  return (
    <div
      className={`mb-6 flex items-center gap-2.5 border px-4 py-2.5 text-xs ${tone}`}
      role="status"
    >
      <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
      <span className="font-medium">{message}</span>
    </div>
  )
}
