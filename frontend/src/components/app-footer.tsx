export function AppFooter() {
  return (
    <footer className="border-t border-border px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <p className="text-[10px] tracking-[0.2em] text-muted-foreground">
          PARBIN // PANAMÁ
        </p>
        <div className="flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <p className="text-[10px] tracking-[0.2em] text-primary">
            SYSTEM ONLINE
          </p>
        </div>
      </div>
    </footer>
  )
}
