import { useMemo, useState } from "react"

import { EventCalendar } from "@/components/event-calendar"
import { EventCard } from "@/components/event-card"
import { StatePanel } from "@/components/state-panel"
import { Button } from "@/components/ui/button"
import { useEventManagerContext } from "@/event-manager-context"
import { getEventDayKeys } from "@/lib/event-days"
import { X } from "lucide-react"

function formatDayKey(dayKey: string) {
  return new Date(`${dayKey}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export function EventsPage() {
  const mgr = useEventManagerContext()
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const eventDays = useMemo(
    () => new Map(mgr.events.map((event) => [event.id, getEventDayKeys(event)])),
    [mgr.events]
  )

  const isOnSelectedDay = (eventId: string) =>
    selectedDay != null && (eventDays.get(eventId) ?? []).includes(selectedDay)

  const selectDay = (dayKey: string) => {
    const next = dayKey === selectedDay ? null : dayKey
    setSelectedDay(next)
    if (!next) return

    const firstMatch = mgr.events.find((event) =>
      (eventDays.get(event.id) ?? []).includes(next)
    )
    if (!firstMatch) return

    requestAnimationFrame(() => {
      document
        .querySelector(`[data-event-id="${firstMatch.id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }

  const isLoading = mgr.isBootstrapping || mgr.isEventsLoading

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-semibold sm:text-3xl">
              {selectedDay ? formatDayKey(selectedDay) : "Coming up"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLoading
                ? "Loading events…"
                : selectedDay
                  ? "Highlighting the events on this day."
                  : `${mgr.events.length} upcoming ${mgr.events.length === 1 ? "event" : "events"} in Panamá`}
            </p>
          </div>
          {selectedDay ? (
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl px-4"
              onClick={() => setSelectedDay(null)}
            >
              <X />
              Show all
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <StatePanel>Loading events…</StatePanel>
        ) : mgr.events.length === 0 ? (
          <StatePanel>
            No upcoming events yet. Know of one? Suggest it from the top bar.
          </StatePanel>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {mgr.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                emphasis={
                  selectedDay == null
                    ? "none"
                    : isOnSelectedDay(event.id)
                      ? "highlighted"
                      : "dimmed"
                }
              />
            ))}
          </div>
        )}
      </section>

      {!isLoading && mgr.events.length > 0 ? (
        <EventCalendar
          events={mgr.events}
          selectedDay={selectedDay}
          onSelectDay={selectDay}
        />
      ) : null}
    </div>
  )
}
