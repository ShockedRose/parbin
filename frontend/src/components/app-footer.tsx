import { Github } from "lucide-react"

export function AppFooter() {
  return (
    <footer className="relative border-t border-border/70 px-6 py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-serif text-foreground">Parbin</span> · Tech
          meetups in Panamá
        </p>
        <a
          href="https://github.com/ShockedRose/parbin"
          target="_blank"
          rel="noreferrer"
          aria-label="Open the Parbin GitHub repository"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
    </footer>
  )
}
