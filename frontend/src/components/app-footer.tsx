import { Link } from "@tanstack/react-router"
import { Github } from "lucide-react"
import { useTranslation } from "react-i18next"

import { REPOSITORY_URL } from "@/lib/links"

export function AppFooter() {
  const { t } = useTranslation()

  return (
    <footer className="relative border-t border-border/70 px-6 py-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-serif text-foreground">
            {t("common.appName")}
          </span>{" "}
          · {t("common.tagline")}
        </p>

        <div className="flex items-center gap-5">
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link
              to="/privacy"
              className="transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              {t("legal.privacy.title")}
            </Link>
            <Link
              to="/terms"
              className="transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              {t("legal.terms.title")}
            </Link>
          </nav>

          <a
            href={REPOSITORY_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t("common.githubRepository")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
