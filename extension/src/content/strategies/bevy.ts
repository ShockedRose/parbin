import type { ExtractedEvent } from "../../shared/types"
import {
  canonicalEventUrl,
  firstString,
  htmlToText,
  imageFromLd,
  isObject,
  isValidDate,
  joinLocationParts,
  jsonLdEvents,
  metaContent,
  type JsonObject,
} from "../util/page"
import type { EventPageStrategy, StrategyOutcome } from "./types"

/** Bevy-hosted community sites (Google Developer Groups, CNCF, ...). */
const BEVY_HOSTS = ["community.dev", "community.cncf.io", "community2.cncf.io"]

/** Accepts `/events/details/{slug}` with optional trailing segments such as `/cohost-{chapter}`. */
export function parseBevyEventSlug(pathname: string): string | null {
  const segs = pathname.split("/").filter(Boolean)
  const i = segs.indexOf("details")
  if (i < 1 || segs[i - 1] !== "events") return null
  const slug = segs[i + 1]
  return slug ? slug.toLowerCase() : null
}

/**
 * Bevy server-renders the event into `__NEXT_DATA__`. Next.js does not refresh
 * that tag on client-side navigation, so callers must check the slug.
 */
function nextEventData(doc: Document): JsonObject | null {
  const raw = doc.getElementById("__NEXT_DATA__")?.textContent
  if (!raw) return null
  try {
    const data: unknown = JSON.parse(raw)
    const props = isObject(data) && isObject(data.props) ? data.props.pageProps : null
    if (!isObject(props)) return null
    const block = isObject(props.customBlockData) ? props.customBlockData.eventData : null
    const event = isObject(props.eventData) ? props.eventData : block
    return isObject(event) ? event : null
  } catch {
    return null
  }
}

/** English tag names; `eventData.tags` is localized to the chapter's language. */
function scriptTags(doc: Document): string[] {
  const raw = doc.getElementById("event_tags")?.textContent
  if (!raw) return []
  try {
    const tags: unknown = JSON.parse(raw)
    return Array.isArray(tags) ? tags.map((t) => firstString(t)).filter(Boolean) : []
  } catch {
    return []
  }
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => firstString(v)).filter(Boolean) : []
}

function ldLocation(ld: JsonObject | null): string {
  const loc = ld?.location
  if (typeof loc === "string") return loc
  if (!isObject(loc) || String(loc["@type"]).toLowerCase() === "virtuallocation") return ""
  const address = isObject(loc.address) ? loc.address : {}
  return joinLocationParts([loc.name, address.streetAddress, address.addressLocality])
}

function cleanOgTitle(title: string): string {
  return title.replace(/\s*\|[^|]*$/, "").trim()
}

function extractBevyEvent(doc: Document, url: URL, slug: string): ExtractedEvent {
  const next = nextEventData(doc)
  const data = next && firstString(next.slug).toLowerCase() === slug ? next : null
  const ld =
    jsonLdEvents(doc).find((e) => {
      const offers = isObject(e.offers) ? e.offers : null
      return firstString(e.url, offers?.url).includes(`/events/details/${slug}`)
    }) ?? null
  // Without a slug match the page was reached by client-side navigation and
  // every embedded payload may describe the previous event, so only the DOM is trusted.
  const fresh = !!data || !!ld

  const isOnline =
    data?.is_virtual_event === true ||
    String(data?.audience_type ?? "").toUpperCase() === "VIRTUAL" ||
    /online/i.test(firstString(ld?.eventAttendanceMode))
  const venue = data
    ? joinLocationParts([data.venue_name, data.venue_address, data.venue_city])
    : ""
  const location = firstString(venue, ldLocation(ld), isOnline ? "Online" : "")

  const startsAt = firstString(data?.start_date_iso, data?.start_date, ld?.startDate)
  const endsAt = firstString(data?.end_date_iso, data?.end_date, ld?.endDate)

  const keywords = data ? [...scriptTags(doc), ...stringList(data.tags)] : fresh ? scriptTags(doc) : []

  return {
    title: firstString(
      data?.title,
      ld?.name,
      doc.querySelector("h1")?.textContent,
      fresh ? metaContent(doc, "twitter:title") : "",
      fresh ? cleanOgTitle(metaContent(doc, "og:title")) : "",
    ),
    description: firstString(
      htmlToText(firstString(data?.description)),
      data?.description_short,
      ld?.description,
      fresh ? metaContent(doc, "og:description") : "",
    ),
    startsAt: isValidDate(startsAt) ? startsAt : null,
    endsAt: isValidDate(endsAt) ? endsAt : null,
    location,
    image: firstString(
      data?.picture,
      data?.event_banner,
      imageFromLd(ld?.image),
      fresh ? metaContent(doc, "og:image") : "",
    ),
    keywords: [...new Set(keywords)],
    sourceEventPage: canonicalEventUrl(`${url.origin}/events/details/${slug}`),
  }
}

export const bevyStrategy: EventPageStrategy = {
  id: "bevy",
  label: "Bevy",

  matchesHost(hostname: string): boolean {
    const h = hostname.toLowerCase()
    return BEVY_HOSTS.some((host) => h === host || h.endsWith(`.${host}`))
  },

  extract(doc: Document, url: URL): StrategyOutcome {
    const slug = parseBevyEventSlug(url.pathname)
    if (!slug) {
      return {
        kind: "not-event",
        message: "Open a specific event (…/events/details/<event>) to suggest it.",
      }
    }
    return { kind: "event", event: extractBevyEvent(doc, url, slug) }
  },
}
