import { Github } from "lucide-react"

export function AppFooter() {
  return (
    <footer className="border-t border-border/80 px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <p className="text-[10px] tracking-wide text-primary/90">
          PARBIN // PANAMÁ
        </p>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/ShockedRose/parbin"
            target="_blank"
            rel="noreferrer"
            aria-label="Open the PARBIN GitHub repository"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary/80 text-foreground/80 transition-all hover:border-primary/45 hover:bg-card hover:text-primary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Github className="h-4 w-4" />
          </a>
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_8px_color-mix(in_srgb,var(--primary)_60%,transparent)]" />
          <p className="text-[10px] tracking-wide text-primary/90">
            SYSTEM ONLINE
          </p>
        </div>
      </div>
    </footer>
  )
}
