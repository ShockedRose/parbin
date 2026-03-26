import type { Page } from "playwright"
import type { SuggestionPayload } from "../api-client.js"

export interface ScrapeStrategy {
  /** Hostname key without leading www, e.g. meetup.com */
  id: string
  /** Return true if this strategy should handle the given hostname */
  matchesHost(hostname: string): boolean
  discoverEventUrls(page: Page, listingUrl: string): Promise<string[]>
  scrapeEvent(page: Page, eventUrl: string): Promise<SuggestionPayload | null>
}
