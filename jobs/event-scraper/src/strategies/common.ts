import type { Page } from "playwright"
import type { SuggestionPayload } from "../api-client.js"
import { defaultEnd, formatParbinDateTime, parseIsoToDate } from "../util/datetime.js"
import { extractEventObjectsFromJsonLd, firstString } from "../util/jsonld.js"
import { looksTechRelated } from "../util/tech-filter.js"
import { canonicalEventUrl } from "../util/url.js"

async function metaContent(page: Page, name: string, property?: string): Promise<string> {
  return page.evaluate(
    ({ name, property }) => {
      if (name) {
        const m = document.querySelector(`meta[name="${name}"]`)?.getAttribute("content")
        if (m) return m
      }
      if (property) {
        const m = document.querySelector(`meta[property="${property}"]`)?.getAttribute("content")
        if (m) return m
      }
      return ""
    },
    { name, property: property ?? "" },
  )
}

function locationFromLd(loc: unknown): string {
  if (typeof loc === "string") return loc
  if (loc && typeof loc === "object") {
    const o = loc as Record<string, unknown>
    return firstString(o.name, o.address && typeof o.address === "object" ? (o.address as { name?: string }).name : "")
  }
  return ""
}

function imageFromLd(img: unknown): string {
  if (typeof img === "string") return img
  if (Array.isArray(img) && img[0]) return imageFromLd(img[0])
  if (img && typeof img === "object" && "url" in img) return String((img as { url: string }).url)
  return ""
}

export async function buildPayloadFromPage(page: Page, eventUrl: string): Promise<SuggestionPayload | null> {
  const canonical = canonicalEventUrl(eventUrl)
  const ldEvents = await extractEventObjectsFromJsonLd(page)

  let title = ""
  let description = ""
  let start: Date | null = null
  let end: Date | null = null
  let location = ""
  let image = ""

  if (ldEvents.length > 0) {
    const e = ldEvents[0]
    title = firstString(e.name, e.headline)
    description = firstString(e.description)
    location = locationFromLd(e.location)
    image = imageFromLd(e.image)
    start = parseIsoToDate(firstString(e.startDate, e.startTime))
    end = parseIsoToDate(firstString(e.endDate, e.endTime))
  }

  if (!title) {
    title = (await metaContent(page, "twitter:title")) || (await metaContent(page, "", "og:title"))
  }
  if (!description) {
    description =
      (await metaContent(page, "description")) || (await metaContent(page, "", "og:description"))
  }
  if (!image) {
    image = await metaContent(page, "", "og:image")
  }

  const textBlob = `${title}\n${description}`
  if (!looksTechRelated(textBlob)) return null

  if (!title) {
    title = (await page.locator("h1").first().innerText().catch(() => "")).trim()
  }
  if (!title) return null

  if (!start) {
    const dt = await page.locator("time[datetime]").first().getAttribute("datetime").catch(() => null)
    if (dt) start = parseIsoToDate(dt)
  }

  if (!start) return null
  if (!end) end = defaultEnd(start)

  const locationTrimmed = location.trim()
  const resolvedLocation = locationTrimmed ? locationTrimmed.slice(0, 2000) : "Remote"

  return {
    title: title.slice(0, 500),
    description: description.slice(0, 8000),
    date: formatParbinDateTime(start),
    endDate: formatParbinDateTime(end),
    location: resolvedLocation,
    image: image.slice(0, 2000),
    tags: [],
    sourceEventPage: canonical,
  }
}

export async function collectHrefPatterns(
  page: Page,
  patterns: { hostIncludes: string; pathIncludes: string }[],
): Promise<string[]> {
  return page.evaluate((pats) => {
    const out = new Set<string>()
    for (const a of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      const href = a.href
      if (!href) continue
      try {
        const u = new URL(href)
        const host = u.hostname.toLowerCase()
        for (const { hostIncludes, pathIncludes } of pats) {
          if (host.includes(hostIncludes) && u.pathname.includes(pathIncludes)) {
            out.add(a.href)
            break
          }
        }
      } catch {
        /* skip */
      }
    }
    return [...out]
  }, patterns)
}
