export function StatusBanner({
  message,
  variant,
}: {
  message: string
  variant: "error" | "notice"
}) {
  const tone =
    variant === "error"
      ? "border-accent/40 bg-accent/10 text-accent"
      : "border-primary/40 bg-primary/10 text-primary"

  return (
    <div className={`mb-6 border px-4 py-3 text-xs tracking-wide ${tone}`}>
      {message}
    </div>
  )
}
