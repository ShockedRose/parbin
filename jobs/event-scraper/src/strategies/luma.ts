import type { Page } from "playwright"
import type { SuggestionPayload } from "../api-client.js"
import { sleep } from "../util/sleep.js"
import { canonicalEventUrl } from "../util/url.js"
import type { ScrapeStrategy } from "./types.js"
import { buildPayloadFromPage } from "./common.js"

const SKIP_SEGMENTS = /^(discover|login|signup|settings|dashboard|embed|calendar)$/i

export const lumaStrategy: ScrapeStrategy = {
  id: "lu.ma",

  matchesHost(hostname: string): boolean {
    const h = hostname.toLowerCase()
    return h === "lu.ma" || h === "luma.com" || h.endsWith(".luma.com")
  },

  async discoverEventUrls(page: Page, listingUrl: string): Promise<string[]> {
    await page.goto(listingUrl, { waitUntil: "domcontentloaded", timeout: 60_000 })
    await sleep(2500)
    const hrefs = await page.evaluate(() => {
      const out = new Set<string>()
      for (const a of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
        try {
          const u = new URL(a.href)
          const host = u.hostname.toLowerCase()
          if (host !== "lu.ma" && !host.endsWith(".lu.ma") && host !== "www.luma.com" && host !== "luma.com") {
            continue
          }
          const path = u.pathname.replace(/\/+$/, "")
          const segs = path.split("/").filter(Boolean)
          if (segs.length !== 1) continue
          out.add(`${u.origin}/${segs[0]}`)
        } catch {
          /* skip */
        }
      }
      return [...out]
    })
    return hrefs
      .filter((h) => {
        try {
          const seg = new URL(h).pathname.split("/").filter(Boolean)[0] ?? ""
          return seg && !SKIP_SEGMENTS.test(seg)
        } catch {
          return false
        }
      })
      .map((h) => canonicalEventUrl(h).split("?")[0])
  },

  async scrapeEvent(page: Page, eventUrl: string): Promise<SuggestionPayload | null> {
    await page.goto(eventUrl, { waitUntil: "domcontentloaded", timeout: 60_000 })
    await sleep(1500)
    return buildPayloadFromPage(page, eventUrl)
  },
}
