export type JsonObject = Record<string, unknown>

export function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

export function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return ""
}

function collectLdEvents(node: unknown, acc: JsonObject[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectLdEvents(item, acc)
    return
  }
  if (!isObject(node)) return
  if (node["@graph"]) collectLdEvents(node["@graph"], acc)
  const type = node["@type"]
  const types = Array.isArray(type) ? type : type ? [type] : []
  if (types.some((t) => String(t).toLowerCase() === "event")) acc.push(node)
}

/** schema.org `Event` objects from every JSON-LD script on the page. */
export function jsonLdEvents(doc: Document): JsonObject[] {
  const events: JsonObject[] = []
  for (const el of doc.querySelectorAll('script[type="application/ld+json"]')) {
    const text = el.textContent?.trim()
    if (!text) continue
    try {
      collectLdEvents(JSON.parse(text), events)
    } catch {
      /* malformed JSON-LD */
    }
  }
  return events
}

export function metaContent(doc: Document, key: string): string {
  const el =
    doc.querySelector(`meta[property="${key}"]`) ?? doc.querySelector(`meta[name="${key}"]`)
  return el?.getAttribute("content")?.trim() ?? ""
}

export function imageFromLd(value: unknown): string {
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.length > 0 ? imageFromLd(value[0]) : ""
  if (isObject(value)) return firstString(value.url, value.contentUrl)
  return ""
}

/** Joins address parts, dropping blanks and any part that another part already contains. */
export function joinLocationParts(parts: unknown[]): string {
  let out: string[] = []
  for (const part of parts) {
    const text = firstString(part)
    if (!text) continue
    const lower = text.toLowerCase()
    if (out.some((existing) => existing.toLowerCase().includes(lower))) continue
    out = out.filter((existing) => !lower.includes(existing.toLowerCase()))
    out.push(text)
  }
  return out.join(", ")
}

/** Removes a dangling UTF-16 high surrogate left by sites that truncate strings by code unit. */
export function trimBrokenSurrogate(text: string): string {
  return text.replace(/[\uD800-\uDBFF]$/, "")
}

/** Same normalization the scraper uses for `sourceEventPage`, so deduplication lines up. */
export function canonicalEventUrl(href: string): string {
  try {
    const u = new URL(href)
    u.hash = ""
    u.search = ""
    u.hostname = u.hostname.toLowerCase()
    u.pathname = u.pathname.replace(/\/+$/, "") || "/"
    return u.toString()
  } catch {
    return href.trim()
  }
}

export function isValidDate(value: string): boolean {
  return !!value && !Number.isNaN(Date.parse(value))
}
