import { useNavigate } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEventManagerContext } from "@/event-manager-context"
import {
  downloadICS,
  formatDateRange,
  getGoogleCalendarUrl,
} from "@/lib/calendar"
import { tagBadgeVariantForIndex } from "@/lib/tag-badge-variant"
import {
  getEventImageTransitionName,
  runViewTransition,
} from "@/lib/view-transitions"
import { Calendar, Download, MapPin } from "lucide-react"
import type { KeyboardEvent, MouseEvent } from "react"

export function EventsPage() {
  const mgr = useEventManagerContext()
  const navigate = useNavigate()

  const openEventDetails = (eventId: string) => {
    runViewTransition(() =>
      navigate({
        to: "/events/$eventId",
        params: { eventId },
      })
    )
  }

  const stopCardNavigation = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
  }

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    eventId: string
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return
    }

    event.preventDefault()
    openEventDetails(eventId)
  }

  return (
    <div>
      <div className="mb-10">
        <div className="mb-1 text-[10px] text-muted-foreground">
          ▸ ACTIVE_FEED // {mgr.events.length} NODES DETECTED
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
          <span className="text-foreground">EVENT_</span>
          <span className="text-primary">STREAM</span>
        </h2>
      </div>

      {mgr.isBootstrapping || mgr.isEventsLoading ? (
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center text-xs text-primary">
          SYNCING_EVENT_FEED...
        </div>
      ) : mgr.events.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center text-xs text-muted-foreground">
          NO_EVENTS_FOUND
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {mgr.events.map((event) => (
            <article
              key={event.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_24px_color-mix(in_srgb,var(--primary)_14%,transparent)]"
              role="button"
              tabIndex={0}
              onClick={() => openEventDetails(event.id)}
              onKeyDown={(clickedEvent) =>
                handleCardKeyDown(clickedEvent, event.id)
              }
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover"
                  style={{
                    filter: "saturate(1) brightness(0.72) contrast(1.18)",
                    viewTransitionName: getEventImageTransitionName(event.id),
                  }}
                />
              </div>

              <div className="p-5">
                <div
                  className="mb-3 h-0.5 w-9 rounded-full bg-accent shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_35%,transparent)]"
                  aria-hidden
                />
                <h3 className="mb-2 font-display text-base font-semibold text-foreground">
                  {event.title}
                </h3>

                <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-primary" />
                    {formatDateRange(event.date, event.endDate)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-accent" />
                    {event.location}
                  </div>
                </div>

                <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {event.description}
                </p>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  {event.tags.map((tag, index) => (
                    <Badge
                      key={tag}
                      variant={tagBadgeVariantForIndex(index)}
                      className="text-[10px] font-medium tracking-wide uppercase"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="sm"
                    className="h-auto min-h-11 w-full flex-1 py-3 text-[10px] uppercase parbin-glow-primary-sm sm:h-7 sm:min-h-0 sm:py-0 sm:min-w-0"
                    asChild
                  >
                    <a
                      href={getGoogleCalendarUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={stopCardNavigation}
                    >
                      <Calendar className="mr-1.5 h-3.5 w-3.5" />
                      ADD TO CALENDAR
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-auto min-h-11 w-full shrink-0 border-white/20 py-3 text-[10px] uppercase sm:h-7 sm:min-h-0 sm:py-0 sm:w-auto"
                    onClick={(clickedEvent) => {
                      stopCardNavigation(clickedEvent)
                      downloadICS(event)
                    }}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    ICS
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
