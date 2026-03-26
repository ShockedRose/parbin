import { config } from "./config.js"
import { logger } from "./logger.js"
import { SCRAPED_TAG } from "./types.js"

export type SuggestionPayload = {
  title: string
  description: string
  date: string
  endDate: string
  location: string
  image: string
  tags: string[]
  sourceEventPage: string
}

function joinUrl(path: string): string {
  const base = config.apiBaseUrl.replace(/\/+$/, "")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export async function fetchKnownSourceUrls(): Promise<Set<string>> {
  const res = await fetch(joinUrl("/api/event-suggestions/source-urls"), {
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`source-urls failed ${res.status}: ${body}`)
  }
  const data = (await res.json()) as { urls?: string[] }
  const urls = Array.isArray(data.urls) ? data.urls : []
  return new Set(urls)
}

function mergeTags(tags: string[]): string[] {
  const withScraped = [...tags, SCRAPED_TAG]
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of withScraped) {
    const k = t.trim().toLowerCase()
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(t.trim())
  }
  return out
}

export async function submitSuggestion(payload: SuggestionPayload): Promise<void> {
  const body = {
    title: payload.title,
    description: payload.description,
    date: payload.date,
    endDate: payload.endDate,
    location: payload.location,
    image: payload.image,
    tags: mergeTags(payload.tags),
    sourceEventPage: payload.sourceEventPage,
  }

  const res = await fetch(joinUrl("/api/event-suggestions"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`create suggestion failed ${res.status}: ${text}`)
  }

  logger.info({ url: payload.sourceEventPage, title: payload.title }, "submitted suggestion")
}
