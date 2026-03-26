import type { Page } from "playwright"
import type { SuggestionPayload } from "../api-client.js"
import { sleep } from "../util/sleep.js"
import { canonicalEventUrl } from "../util/url.js"
import type { ScrapeStrategy } from "./types.js"
import { buildPayloadFromPage } from "./common.js"

/**
 * Bevy-style chapter pages (CNCF, GDG on community.dev): links to event detail pages
 * use paths containing `/events/details/`.
 */
async function discoverBevyChapterEventLinks(
  page: Page,
  listingUrl: string,
  hostMatcher: (host: string) => boolean,
): Promise<string[]> {
  await page.goto(listingUrl.replace(/\/+$/, ""), { waitUntil: "domcontentloaded", timeout: 60_000 })
  await sleep(2500)

  try {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  } catch {
    /* ignore */
  }
  await sleep(1200)

  const origin = new URL(listingUrl).origin
  const raw = await page.evaluate((pageOrigin: string) => {
    const out: { href: string; host: string }[] = []
    const seen = new Set<string>()
    for (const a of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      try {
        const raw = a.getAttribute("href") || ""
        if (!raw || raw.startsWith("#")) continue
        const u = new URL(raw, pageOrigin)
        if (!u.pathname.includes("/events/details/")) continue
        const href = u.toString().split("#")[0].split("?")[0]
        if (seen.has(href)) continue
        seen.add(href)
        out.push({ href, host: u.hostname.toLowerCase() })
      } catch {
        /* skip */
      }
    }
    return out
  }, origin)

  return raw.filter((x) => hostMatcher(x.host)).map((x) => x.href)
}

export const cncfCommunityStrategy: ScrapeStrategy = {
  id: "community.cncf.io",

  matchesHost(hostname: string): boolean {
    const h = hostname.toLowerCase()
    return h === "community.cncf.io" || h.endsWith(".community.cncf.io")
  },

  async discoverEventUrls(page: Page, listingUrl: string): Promise<string[]> {
    const hrefs = await discoverBevyChapterEventLinks(page, listingUrl, (h) =>
      h === "community.cncf.io" || h.endsWith(".community.cncf.io"),
    )
    return [...new Set(hrefs.map((u) => canonicalEventUrl(u)))]
  },

  async scrapeEvent(page: Page, eventUrl: string): Promise<SuggestionPayload | null> {
    await page.goto(eventUrl, { waitUntil: "domcontentloaded", timeout: 60_000 })
    await sleep(1500)
    return buildPayloadFromPage(page, eventUrl)
  },
}

export const gdgCommunityStrategy: ScrapeStrategy = {
  id: "gdg.community.dev",

  matchesHost(hostname: string): boolean {
    const h = hostname.toLowerCase()
    return h === "gdg.community.dev" || h.endsWith(".gdg.community.dev")
  },

  async discoverEventUrls(page: Page, listingUrl: string): Promise<string[]> {
    const hrefs = await discoverBevyChapterEventLinks(page, listingUrl, (h) =>
      h === "gdg.community.dev" || h.endsWith(".gdg.community.dev"),
    )
    return [...new Set(hrefs.map((u) => canonicalEventUrl(u)))]
  },

  async scrapeEvent(page: Page, eventUrl: string): Promise<SuggestionPayload | null> {
    await page.goto(eventUrl, { waitUntil: "domcontentloaded", timeout: 60_000 })
    await sleep(1500)
    return buildPayloadFromPage(page, eventUrl)
  },
}
