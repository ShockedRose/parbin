import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { listPastEvents } from "@/lib/api"
import {
  downloadICS,
  formatDateRange,
  getGoogleCalendarUrl,
} from "@/lib/calendar"
import {
  getEventImageTransitionName,
  runViewTransition,
} from "@/lib/view-transitions"
import type { MeetupEvent } from "@/types/event"
import { Calendar, Download, MapPin } from "lucide-react"
import type { KeyboardEvent, MouseEvent } from "react"

export function PastEventsPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<MeetupEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setIsLoading(true)
      try {
        const next = await listPastEvents()
        if (active) {
          setEvents(next)
          setError(null)
        }
      } catch {
        if (active) {
          setError("Failed to load past events.")
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

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
          ▸ ARCHIVE_FEED // {events.length} PAST_NODES (MAX_10)
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
          <span className="text-foreground">PAST_</span>
          <span className="text-primary">EVENTS</span>
        </h2>
        <p className="mt-2 max-w-2xl text-xs text-muted-foreground">
          Unlisted route — recent concluded events from the app timezone calendar
          day boundary.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center text-xs text-primary">
          SYNCING_ARCHIVE...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center text-xs text-destructive">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center text-xs text-muted-foreground">
          NO_PAST_EVENTS_IN_ARCHIVE
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {events.map((event) => (
            <article
              key={event.id}
              className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_24px_color-mix(in_srgb,var(--primary)_14%,transparent)]"
              role="button"
              tabIndex={0}
              onClick={() => openEventDetails(event.id)}
              onKeyDown={(clickedEvent) =>
                handleCardKeyDown(clickedEvent, event.id)
              }
            >
              <div className="relative h-52 shrink-0 overflow-hidden">
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

              <div className="flex min-h-0 flex-1 flex-col p-5">
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
                  {event.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="node"
                      className="text-[10px] font-medium tracking-wide uppercase"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-auto flex shrink-0 flex-col gap-2 sm:flex-row">
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
