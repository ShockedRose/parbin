export function AppFooter() {
  return (
    <footer className="border-t border-border/80 px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <p className="text-[10px] tracking-wide text-primary/90">
          PARBIN // PANAMÁ
        </p>
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_8px_color-mix(in_srgb,var(--primary)_60%,transparent)]" />
          <p className="text-[10px] tracking-wide text-primary/90">
            SYSTEM ONLINE
          </p>
        </div>
      </div>
    </footer>
  )
}
