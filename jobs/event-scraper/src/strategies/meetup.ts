import type { Page } from "playwright"
import type { SuggestionPayload } from "../api-client.js"
import { sleep } from "../util/sleep.js"
import { canonicalEventUrl } from "../util/url.js"
import type { ScrapeStrategy } from "./types.js"
import { buildPayloadFromPage } from "./common.js"

/** First path segment of a Meetup group URL, e.g. `aws-user-group-panama` from `/aws-user-group-panama`. */
export function meetupGroupSlug(listingUrl: string): string | null {
  try {
    const u = new URL(listingUrl)
    const segs = u.pathname.split("/").filter(Boolean)
    if (segs.length === 0) return null
    const slug = segs[0]!
    if (slug === "find" || slug === "events" || slug === "login") return null
    return slug
  } catch {
    return null
  }
}

function collectGroupEventLinks(page: Page, slug: string, origin: string): Promise<string[]> {
  return page.evaluate(
    ({ groupSlug, pageOrigin }: { groupSlug: string; pageOrigin: string }) => {
      const out = new Set<string>()
      const prefix = `/${groupSlug}/events/`
      for (const a of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
        try {
          const raw = a.getAttribute("href") || ""
          if (!raw || raw.startsWith("#")) continue
          const u = new URL(raw, pageOrigin)
          if (!u.hostname.toLowerCase().includes("meetup")) continue
          const path = u.pathname.replace(/\/+$/, "") || "/"
          if (!path.startsWith(prefix)) continue
          const afterPrefix = path.slice(prefix.length)
          const idSeg = afterPrefix.split("/").filter(Boolean)[0]
          if (!idSeg || !/^\d+$/.test(idSeg)) continue
          const canonicalPath = `${prefix}${idSeg}`
          out.add(`${u.origin}${canonicalPath}/`)
        } catch {
          /* skip */
        }
      }
      return [...out]
    },
    { groupSlug: slug, pageOrigin: origin },
  )
}

export const meetupStrategy: ScrapeStrategy = {
  id: "meetup.com",

  matchesHost(hostname: string): boolean {
    const h = hostname.toLowerCase()
    return h === "meetup.com" || h.endsWith(".meetup.com")
  },

  /**
   * Expects a specific group home URL (`https://www.meetup.com/{group-slug}`).
   * Discovers only `/group-slug/events/{numeric-id}/` links for that group.
   */
  async discoverEventUrls(page: Page, listingUrl: string): Promise<string[]> {
    const slug = meetupGroupSlug(listingUrl)
    if (!slug) return []

    const base = new URL(listingUrl)
    const origin = base.origin
    const normalizedHome = `${origin}/${slug}`.replace(/\/+$/, "")

    await page.goto(normalizedHome, { waitUntil: "domcontentloaded", timeout: 60_000 })
    await sleep(2500)

    let urls = await collectGroupEventLinks(page, slug, origin)

    if (urls.length === 0) {
      const eventsTab = `${origin}/${slug}/events/`
      await page.goto(eventsTab, { waitUntil: "domcontentloaded", timeout: 60_000 })
      await sleep(2500)
      urls = await collectGroupEventLinks(page, slug, origin)
    }

    return [...new Set(urls.map((u) => canonicalEventUrl(u).split("?")[0]))]
  },

  async scrapeEvent(page: Page, eventUrl: string): Promise<SuggestionPayload | null> {
    await page.goto(eventUrl, { waitUntil: "domcontentloaded", timeout: 60_000 })
    await sleep(1500)
    return buildPayloadFromPage(page, eventUrl)
  },
}
