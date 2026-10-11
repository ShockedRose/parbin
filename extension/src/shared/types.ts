/** Event data read from a page, before the user reviews it in the popup. */
export type ExtractedEvent = {
  title: string
  description: string
  /** ISO 8601 with offset, or null when the page does not expose it. */
  startsAt: string | null
  endsAt: string | null
  location: string
  image: string
  /** Free-form topics/keywords from the page, matched against the Parbin tag catalog. */
  keywords: string[]
  sourceEventPage: string
}

export type StrategyInfo = {
  id: string
  label: string
}

export type ExtractionResult =
  | { status: "ok"; strategy: StrategyInfo; event: ExtractedEvent }
  | { status: "not-event"; strategy: StrategyInfo; message: string }
  | { status: "unsupported"; hostname: string }
  | { status: "error"; message: string }

/** Body of `POST /api/event-suggestions` (see docs/api.md). */
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

export type CatalogTag = {
  id: string
  name: string
}
