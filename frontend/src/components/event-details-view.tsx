import {
  Calendar,
  CalendarPlus,
  Download,
  ExternalLink,
  MapPin,
} from "lucide-react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import {
  downloadICS,
  formatDateRange,
  getGoogleCalendarUrl,
  trackGoogleCalendarOpen,
} from "@/lib/calendar"
import { cn } from "@/lib/utils"
import { getEventImageTransitionName } from "@/lib/view-transitions"
import type { MeetupEvent } from "@/types/event"

/**
 * Read-only rendering of an event, shared by the public event page and the
 * admin suggestion preview dialog so both stay visually identical.
 */
export function EventDetailsView({
  event,
  actions,
  className,
}: {
  event: MeetupEvent
  actions?: ReactNode
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card",
        className
      )}
    >
      <div className="h-64 overflow-hidden bg-muted sm:h-96">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover"
          style={{
            filter: "brightness(0.9)",
            viewTransitionName: getEventImageTransitionName(event.id),
          }}
        />
      </div>

      <div className="min-w-0 space-y-6 p-6 sm:p-8">
        <header className="space-y-3">
          {event.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="tag">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="max-w-3xl font-serif text-3xl leading-tight font-semibold break-words sm:text-4xl">
              {event.title}
            </h1>
            {actions}
          </div>
        </header>

        <div className="flex min-w-0 flex-wrap gap-2 text-sm">
          <div className="flex max-w-full min-w-0 items-start gap-2 rounded-xl bg-muted px-3 py-2">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 break-words">
              {formatDateRange(event.date, event.endDate)}
            </span>
          </div>
          <div className="flex max-w-full min-w-0 items-start gap-2 rounded-xl bg-muted px-3 py-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span className="min-w-0 break-words">{event.location}</span>
          </div>
          {event.sourceEventPage ? (
            <a
              href={event.sourceEventPage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex max-w-full min-w-0 items-start gap-2 rounded-xl bg-muted px-3 py-2 transition-colors hover:bg-primary/15"
            >
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 break-all">
                {t("pages.eventDetails.originalListing")}
              </span>
            </a>
          ) : null}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={getGoogleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGoogleCalendarOpen(event)}
            className="flex min-w-0 items-start gap-3 rounded-xl bg-primary px-5 py-4 text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <CalendarPlus className="mt-0.5 h-5 w-5 shrink-0" />
            <span className="min-w-0">
              <span className="block font-semibold">
                {t("pages.eventDetails.addToGoogle")}
              </span>
              <span className="mt-0.5 block text-sm text-primary-foreground/75">
                {t("pages.eventDetails.addToGoogleHint")}
              </span>
            </span>
          </a>

          <button
            type="button"
            onClick={() => downloadICS(event)}
            className="flex min-w-0 items-start gap-3 rounded-xl border border-border px-5 py-4 text-left transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <Download className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="min-w-0">
              <span className="block font-semibold">
                {t("pages.eventDetails.downloadIcs")}
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {t("pages.eventDetails.downloadIcsHint")}
              </span>
            </span>
          </button>
        </div>

        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="font-serif text-xl font-semibold">
            {t("pages.eventDetails.about")}
          </h2>
          <p className="leading-7 whitespace-pre-wrap text-foreground/85">
            {event.description}
          </p>
        </section>
      </div>
    </article>
  )
}
