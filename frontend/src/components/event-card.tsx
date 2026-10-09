import { useNavigate } from "@tanstack/react-router"
import { CalendarPlus, Download, MapPin } from "lucide-react"
import type { KeyboardEvent, MouseEvent } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  downloadICS,
  formatDateRange,
  getGoogleCalendarUrl,
  trackGoogleCalendarOpen,
} from "@/lib/calendar"
import { cn } from "@/lib/utils"
import {
  getEventImageTransitionName,
  runViewTransition,
} from "@/lib/view-transitions"
import type { MeetupEvent } from "@/types/event"

export type EventCardEmphasis = "none" | "highlighted" | "dimmed"

export function EventCard({
  event,
  emphasis = "none",
}: {
  event: MeetupEvent
  emphasis?: EventCardEmphasis
}) {
  const navigate = useNavigate()

  const openEventDetails = () => {
    runViewTransition(() =>
      navigate({
        to: "/events/$eventId",
        params: { eventId: event.id },
      })
    )
  }

  const stopCardNavigation = (clickedEvent: MouseEvent<HTMLElement>) => {
    clickedEvent.stopPropagation()
  }

  const handleKeyDown = (keyEvent: KeyboardEvent<HTMLElement>) => {
    if (keyEvent.target !== keyEvent.currentTarget) return
    if (keyEvent.key !== "Enter" && keyEvent.key !== " ") return

    keyEvent.preventDefault()
    openEventDetails()
  }

  return (
    <article
      data-event-id={event.id}
      className={cn(
        "group flex h-full min-h-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 outline-none hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_22px_40px_-28px_rgba(0,0,0,0.9)] focus-visible:ring-3 focus-visible:ring-ring/40",
        emphasis === "highlighted" &&
          "border-accent/70 shadow-[0_0_0_1px_var(--accent),0_22px_40px_-28px_color-mix(in_srgb,var(--accent)_60%,transparent)] hover:border-accent/70",
        emphasis === "dimmed" && "opacity-35 hover:opacity-80"
      )}
      role="button"
      tabIndex={0}
      onClick={openEventDetails}
      onKeyDown={handleKeyDown}
    >
      <div className="relative h-36 shrink-0 overflow-hidden bg-muted">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          style={{
            filter: "brightness(0.88)",
            viewTransitionName: getEventImageTransitionName(event.id),
          }}
        />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col px-5 pt-4 pb-5">
        <div className="text-[13px] font-semibold text-muted-foreground">
          {formatDateRange(event.date, event.endDate)}
        </div>
        <h3 className="mt-1 font-serif text-lg leading-snug font-semibold text-foreground">
          {event.title}
        </h3>
        <div className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0">{event.location}</span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground/90">
          {event.description}
        </p>

        {event.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <Badge key={tag} variant="tag">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          <Button size="lg" className="rounded-xl px-4" asChild>
            <a
              href={getGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(clickedEvent) => {
                stopCardNavigation(clickedEvent)
                trackGoogleCalendarOpen(event)
              }}
            >
              <CalendarPlus />
              Add to calendar
            </a>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="rounded-xl px-3 text-muted-foreground"
            onClick={(clickedEvent) => {
              stopCardNavigation(clickedEvent)
              downloadICS(event)
            }}
          >
            <Download />
            .ics
          </Button>
        </div>
      </div>
    </article>
  )
}
