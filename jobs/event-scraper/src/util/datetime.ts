const TZ = "America/Panama"

/** Backend accepts local wall time without Z (see Go parseDateTime). */
export function formatParbinDateTime(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00"

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`
}

export function parseIsoToDate(value: string): Date | null {
  const t = Date.parse(value)
  if (Number.isNaN(t)) return null
  return new Date(t)
}

/** Default end = start + 2h when missing */
export function defaultEnd(start: Date): Date {
  return new Date(start.getTime() + 2 * 60 * 60 * 1000)
}
