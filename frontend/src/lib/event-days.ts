import { eachDayOfInterval, format, startOfDay } from "date-fns"

import type { MeetupEvent } from "@/types/event"

const MAX_EVENT_SPAN_DAYS = 14

export function toDayKey(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

/** Local calendar days an event covers, capped so malformed ranges stay small. */
export function getEventDayKeys(event: MeetupEvent): string[] {
  const start = startOfDay(new Date(event.date))
  const end = startOfDay(new Date(event.endDate))

  if (Number.isNaN(start.getTime())) {
    return []
  }

  if (Number.isNaN(end.getTime()) || end <= start) {
    return [toDayKey(start)]
  }

  return eachDayOfInterval({ start, end })
    .slice(0, MAX_EVENT_SPAN_DAYS)
    .map(toDayKey)
}
