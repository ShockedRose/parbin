import type { Page } from "playwright"
import type { SuggestionPayload } from "../api-client.js"
import { sleep } from "../util/sleep.js"
import { canonicalEventUrl } from "../util/url.js"
import type { ScrapeStrategy } from "./types.js"
import { buildPayloadFromPage, collectHrefPatterns } from "./common.js"

export const eventbriteStrategy: ScrapeStrategy = {
  id: "eventbrite.com",

  matchesHost(hostname: string): boolean {
    const h = hostname.toLowerCase()
    return h === "eventbrite.com" || h.endsWith(".eventbrite.com")
  },

  async discoverEventUrls(page: Page, listingUrl: string): Promise<string[]> {
    await page.goto(listingUrl, { waitUntil: "domcontentloaded", timeout: 60_000 })
    await sleep(2500)
    const raw = await collectHrefPatterns(page, [
      { hostIncludes: "eventbrite", pathIncludes: "/e/" },
    ])
    const urls = new Set<string>()
    for (const href of raw) {
      urls.add(canonicalEventUrl(href).split("?")[0])
    }
    return [...urls]
  },

  async scrapeEvent(page: Page, eventUrl: string): Promise<SuggestionPayload | null> {
    await page.goto(eventUrl, { waitUntil: "domcontentloaded", timeout: 60_000 })
    await sleep(1500)
    return buildPayloadFromPage(page, eventUrl)
  },
}
