import { Link } from "@tanstack/react-router"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { useTranslation } from "react-i18next"

import { PageHeader } from "@/components/page-header"
import { getIntlLocale } from "@/lib/i18n-date"
import type { LegalSectionContent } from "@/lib/legal"
import { REPOSITORY_ISSUES_URL } from "@/lib/links"

/** Update when the wording of the legal pages changes. */
const LEGAL_LAST_UPDATED = new Date("2026-11-24T00:00:00")

export function LegalPage({
  title,
  description,
  sections,
}: {
  title: string
  description: string
  sections: LegalSectionContent[]
}) {
  const { t } = useTranslation()
  const updatedAt = new Intl.DateTimeFormat(getIntlLocale(), {
    dateStyle: "long",
  }).format(LEGAL_LAST_UPDATED)

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={title} description={description} />

      <article className="rounded-2xl border border-border bg-card px-6 py-2 sm:px-8">
        <p className="pt-6 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("legal.updated", { date: updatedAt })}
        </p>

        <div className="divide-y divide-border">
          {sections.map((section) => (
            <section key={section.heading} className="py-6">
              <h2 className="font-serif text-lg font-semibold tracking-tight sm:text-xl">
                {section.heading}
              </h2>

              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-sm leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}

              {section.bullets ? (
                <ul className="mt-3 space-y-2">
                  {section.bullets.map((item) => (
                    <li
                      key={item}
                      className="relative pl-5 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span
                        aria-hidden
                        className="absolute top-2 left-0 h-1.5 w-1.5 rounded-full bg-accent/80"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </article>

      <section className="mt-6 rounded-2xl border border-border bg-muted/30 p-6">
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          {t("legal.contact.heading")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("legal.contact.body")}
        </p>
        <a
          href={REPOSITORY_ISSUES_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-accent focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          {t("legal.contact.link")}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </section>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        {t("legal.backToEvents")}
      </Link>
    </div>
  )
}
