import { useNavigate } from "@tanstack/react-router"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useRef, useState, type PointerEvent } from "react"

import { Button } from "@/components/ui/button"
import { getEventDayKeys, toDayKey } from "@/lib/event-days"
import { cn } from "@/lib/utils"
import { runViewTransition } from "@/lib/view-transitions"
import type { MeetupEvent } from "@/types/event"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MAX_VISIBLE_PER_DAY = 2
const SWIPE_THRESHOLD_PX = 60

type SlideDirection = "next" | "prev" | null

export function EventCalendar({
  events,
  selectedDay,
  onSelectDay,
}: {
  events: MeetupEvent[]
  selectedDay: string | null
  onSelectDay: (dayKey: string) => void
}) {
  const navigate = useNavigate()
  const todayKey = toDayKey(new Date())

  const [month, setMonth] = useState(() =>
    startOfMonth(events[0] ? new Date(events[0].date) : new Date())
  )
  const [direction, setDirection] = useState<SlideDirection>(null)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const didSwipe = useRef(false)

  const eventsByDay = useMemo(() => {
    const byDay = new Map<string, MeetupEvent[]>()
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))
    for (const event of sorted) {
      for (const key of getEventDayKeys(event)) {
        byDay.set(key, [...(byDay.get(key) ?? []), event])
      }
    }
    return byDay
  }, [events])

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
      }),
    [month]
  )

  const monthEventCount = useMemo(() => {
    const ids = new Set<string>()
    for (const day of days) {
      if (!isSameMonth(day, month)) continue
      for (const event of eventsByDay.get(toDayKey(day)) ?? []) {
        ids.add(event.id)
      }
    }
    return ids.size
  }, [days, eventsByDay, month])

  const slide = (delta: number) => {
    setDirection(delta > 0 ? "next" : "prev")
    setMonth((current) => addMonths(current, delta))
  }

  const goToToday = () => {
    const target = startOfMonth(new Date())
    if (target.getTime() === month.getTime()) return
    setDirection(target > month ? "next" : "prev")
    setMonth(target)
  }

  const openEvent = (eventId: string) => {
    runViewTransition(() =>
      navigate({ to: "/events/$eventId", params: { eventId } })
    )
  }

  const handlePointerDown = (pointerEvent: PointerEvent<HTMLDivElement>) => {
    swipeStart.current = { x: pointerEvent.clientX, y: pointerEvent.clientY }
    didSwipe.current = false
  }

  const handlePointerUp = (pointerEvent: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current
    swipeStart.current = null
    if (!start) return

    const dx = pointerEvent.clientX - start.x
    const dy = pointerEvent.clientY - start.y
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) {
      return
    }

    didSwipe.current = true
    slide(dx < 0 ? 1 : -1)
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
            {format(month, "MMMM yyyy")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {monthEventCount === 0
              ? "Nothing scheduled this month yet."
              : `${monthEventCount} ${monthEventCount === 1 ? "event" : "events"} this month`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl px-4"
            onClick={goToToday}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon-lg"
            className="rounded-xl"
            aria-label="Previous month"
            onClick={() => slide(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-lg"
            className="rounded-xl"
            aria-label="Next month"
            onClick={() => slide(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-2 text-center text-xs font-semibold text-muted-foreground/70 sm:gap-2">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>
            <span className="sm:hidden">{weekday[0]}</span>
            <span className="hidden sm:inline">{weekday}</span>
          </span>
        ))}
      </div>

      <div
        className="touch-pan-y overflow-hidden select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => (swipeStart.current = null)}
        onClickCapture={(clickEvent) => {
          if (didSwipe.current) {
            clickEvent.stopPropagation()
            didSwipe.current = false
          }
        }}
      >
        <div
          key={toDayKey(month)}
          role="grid"
          aria-label={format(month, "MMMM yyyy")}
          className={cn(
            "grid grid-cols-7 gap-1 duration-300 ease-out animate-in fade-in sm:gap-2",
            direction === "next" && "slide-in-from-right-10",
            direction === "prev" && "slide-in-from-left-10"
          )}
        >
          {days.map((day) => {
            const key = toDayKey(day)
            const dayEvents = eventsByDay.get(key) ?? []
            const inMonth = isSameMonth(day, month)
            const hasEvents = inMonth && dayEvents.length > 0
            const isSelected = hasEvents && key === selectedDay
            const isToday = key === todayKey
            const hiddenCount = dayEvents.length - MAX_VISIBLE_PER_DAY

            return (
              <div
                key={key}
                role="gridcell"
                aria-selected={isSelected}
                className={cn(
                  "flex min-h-14 min-w-0 flex-col gap-1 rounded-xl border p-1.5 transition-colors sm:min-h-24 sm:p-2 lg:min-h-32 lg:p-2.5",
                  !inMonth && "border-transparent opacity-30",
                  inMonth && !hasEvents && "border-border/60 bg-background/40",
                  hasEvents &&
                    "cursor-pointer border-primary/25 bg-primary/[0.07] hover:border-primary/55",
                  isSelected && "border-accent bg-accent/10 hover:border-accent"
                )}
                onClick={hasEvents ? () => onSelectDay(key) : undefined}
              >
                <div className="flex items-center justify-between">
                  {hasEvents ? (
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={`${format(day, "EEEE, MMMM d")}, ${dayEvents.length} ${dayEvents.length === 1 ? "event" : "events"}`}
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded-lg text-sm font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground",
                        isToday && !isSelected && "ring-1 ring-foreground/70"
                      )}
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation()
                        onSelectDay(key)
                      }}
                    >
                      {format(day, "d")}
                    </button>
                  ) : (
                    <span
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded-lg text-sm font-medium text-muted-foreground",
                        isToday && "text-foreground ring-1 ring-foreground/70"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  )}
                </div>

                {hasEvents ? (
                  <>
                    <div className="flex gap-1 px-1 sm:hidden" aria-hidden>
                      {dayEvents.slice(0, 3).map((event) => (
                        <span
                          key={event.id}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isSelected ? "bg-accent" : "bg-primary"
                          )}
                        />
                      ))}
                    </div>

                    <div className="hidden min-w-0 flex-col gap-1 sm:flex">
                      {dayEvents.slice(0, MAX_VISIBLE_PER_DAY).map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          title={event.title}
                          className={cn(
                            "truncate rounded-md border-l-2 px-2 py-1 text-left text-xs font-medium text-foreground/90 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                            isSelected
                              ? "border-accent bg-accent/15 hover:bg-accent hover:text-accent-foreground"
                              : "border-primary bg-primary/12 hover:bg-primary hover:text-primary-foreground"
                          )}
                          onClick={(clickEvent) => {
                            clickEvent.stopPropagation()
                            openEvent(event.id)
                          }}
                        >
                          {event.title}
                        </button>
                      ))}
                      {hiddenCount > 0 ? (
                        <span className="px-2 text-xs text-muted-foreground">
                          +{hiddenCount} more
                        </span>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <i className="h-3 w-3 rounded-[4px] border border-primary/50 bg-primary/15" />
          Has events
        </span>
        <span className="flex items-center gap-2">
          <i className="h-3 w-3 rounded-[4px] bg-accent" />
          Selected day
        </span>
        <span className="flex items-center gap-2">
          <i className="h-3 w-3 rounded-[4px] ring-1 ring-foreground/70" />
          Today
        </span>
        <span className="ml-auto hidden sm:inline">
          Swipe or use the arrows to change months
        </span>
      </div>
    </section>
  )
}
