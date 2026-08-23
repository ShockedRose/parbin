import { config } from "./config.js"
import { logger } from "./logger.js"
import {
  type CatalogTag,
  resolveSuggestionTags,
} from "./util/tags.js"

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

export async function fetchCatalogTags(): Promise<CatalogTag[]> {
  const res = await fetch(joinUrl("/api/tags"), {
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`tags catalog failed ${res.status}: ${body}`)
  }
  const data = (await res.json()) as { tags?: CatalogTag[] }
  const tags = Array.isArray(data.tags) ? data.tags : []
  return tags.filter(
    (tag): tag is CatalogTag =>
      !!tag &&
      typeof tag.id === "string" &&
      typeof tag.name === "string" &&
      tag.name.trim() !== "",
  )
}

export async function submitSuggestion(
  payload: SuggestionPayload,
  catalog: CatalogTag[],
): Promise<void> {
  const tags = resolveSuggestionTags(
    catalog,
    payload.tags,
    payload.title,
    payload.description,
  )

  const body = {
    title: payload.title,
    description: payload.description,
    date: payload.date,
    endDate: payload.endDate,
    location: payload.location,
    image: payload.image,
    tags,
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

  logger.info(
    { url: payload.sourceEventPage, title: payload.title, tags },
    "submitted suggestion",
  )
}
