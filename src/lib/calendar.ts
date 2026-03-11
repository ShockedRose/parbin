import type { MeetupEvent } from "@/types/event"

function toICSDate(dateStr: string): string {
  return new Date(dateStr)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
}

export function getGoogleCalendarUrl(event: MeetupEvent): string {
  const start = toICSDate(event.date)
  const end = toICSDate(event.endDate)
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
    location: event.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadICS(event: MeetupEvent): void {
  const start = toICSDate(event.date)
  const end = toICSDate(event.endDate)
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TechMeetups//EN",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location}`,
    `UID:${event.id}@techmeetups`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} · ${formatTime(start)} – ${formatTime(end)}`
}
