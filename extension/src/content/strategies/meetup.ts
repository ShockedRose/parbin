import type { ExtractedEvent } from "../../shared/types"
import {
  canonicalEventUrl,
  firstString,
  imageFromLd,
  isObject,
  isValidDate,
  joinLocationParts,
  jsonLdEvents,
  metaContent,
  trimBrokenSurrogate,
  type JsonObject,
} from "../util/page"
import type { EventPageStrategy, StrategyOutcome } from "./types"

type MeetupEventPath = { group: string; eventId: string }

/** Accepts `/{group}/events/{id}` with an optional locale prefix such as `/es/`. */
export function parseMeetupEventPath(pathname: string): MeetupEventPath | null {
  const segs = pathname.split("/").filter(Boolean)
  for (let i = 1; i < segs.length - 1; i++) {
    const id = segs[i + 1]!
    if (segs[i] === "events" && /^\d+$/.test(id)) {
      return { group: segs[i - 1]!.toLowerCase(), eventId: id }
    }
  }
  return null
}

/**
 * Meetup server-renders its Apollo cache into `__NEXT_DATA__`. The tag is not
 * refreshed on client-side navigation, so callers must look up the event by id.
 */
function apolloState(doc: Document): JsonObject | null {
  const raw = doc.getElementById("__NEXT_DATA__")?.textContent
  if (!raw) return null
  try {
    const data: unknown = JSON.parse(raw)
    const state = isObject(data) && isObject(data.props) && isObject(data.props.pageProps)
      ? data.props.pageProps.__APOLLO_STATE__
      : null
    return isObject(state) ? state : null
  } catch {
    return null
  }
}

function deref(state: JsonObject, value: unknown): JsonObject | null {
  if (isObject(value) && typeof value.__ref === "string") {
    const target = state[value.__ref]
    return isObject(target) ? target : null
  }
  return isObject(value) ? value : null
}

function apolloTopics(state: JsonObject, event: JsonObject): string[] {
  const topics = deref(state, event.topics)
  const edges = topics && Array.isArray(topics.edges) ? topics.edges : []
  return edges
    .map((edge) => (isObject(edge) ? deref(state, edge.node) : null))
    .map((node) => firstString(node?.name))
    .filter(Boolean)
}

function ldKeywords(value: unknown): string[] {
  if (typeof value === "string") return value.split(/[,;|]/).map((k) => k.trim()).filter(Boolean)
  if (Array.isArray(value)) return value.map((k) => firstString(k)).filter(Boolean)
  return []
}

function ldLocation(ld: JsonObject | null): string {
  const loc = ld?.location
  if (typeof loc === "string") return loc
  if (!isObject(loc) || String(loc["@type"]).toLowerCase() === "virtuallocation") return ""
  const address = isObject(loc.address) ? loc.address : {}
  return joinLocationParts([loc.name, address.streetAddress, address.addressLocality])
}

function normalizeForCompare(text: string): string {
  return text.replace(/[*_#>`]/g, "").replace(/\s+/g, " ").trim().toLowerCase()
}

/** JSON-LD only carries a truncated description; find the rendered block that starts with it. */
function renderedDescription(doc: Document, truncated: string): string {
  const prefix = normalizeForCompare(truncated).slice(0, 40)
  if (prefix.length < 10) return ""
  let best = ""
  for (const el of doc.querySelectorAll<HTMLElement>('[class*="break-words"]')) {
    const text = el.innerText?.trim() ?? ""
    if (text.length > best.length && normalizeForCompare(text).startsWith(prefix)) best = text
  }
  return best
}

function cleanOgTitle(title: string): string {
  return title.replace(/\s*\|\s*Meetup\s*$/i, "").trim()
}

function extractMeetupEvent(doc: Document, path: MeetupEventPath): ExtractedEvent {
  const state = apolloState(doc)
  const apollo = state ? deref(state, state[`Event:${path.eventId}`]) : null
  const ld =
    jsonLdEvents(doc).find((e) => firstString(e.url).includes(`/events/${path.eventId}`)) ?? null

  const ldDescription = trimBrokenSurrogate(firstString(ld?.description))
  const description = firstString(
    apollo?.description,
    renderedDescription(doc, ldDescription),
    ldDescription,
    metaContent(doc, "og:description"),
  )

  const venue = state && apollo ? deref(state, apollo.venue) : null
  const isOnline =
    String(apollo?.eventType ?? "").toUpperCase() === "ONLINE" ||
    /online/i.test(firstString(ld?.eventAttendanceMode))
  const venueText = venue ? joinLocationParts([venue.name, venue.address, venue.city]) : ""
  const location = firstString(venueText, ldLocation(ld), isOnline ? "Online" : "")

  const photo = state && apollo ? deref(state, apollo.featuredEventPhoto ?? apollo.displayPhoto) : null
  const image = firstString(photo?.highResUrl, imageFromLd(ld?.image), metaContent(doc, "og:image"))

  const startsAt = firstString(
    apollo?.dateTime,
    ld?.startDate,
    doc.querySelector("time[datetime]")?.getAttribute("datetime"),
  )
  const endsAt = firstString(apollo?.endTime, ld?.endDate)

  const keywords = [
    ...(state && apollo ? apolloTopics(state, apollo) : []),
    ...ldKeywords(ld?.keywords),
  ]

  return {
    title: firstString(
      apollo?.title,
      ld?.name,
      doc.querySelector("h1")?.textContent,
      cleanOgTitle(metaContent(doc, "og:title")),
    ),
    description,
    startsAt: isValidDate(startsAt) ? startsAt : null,
    endsAt: isValidDate(endsAt) ? endsAt : null,
    location,
    image,
    keywords: [...new Set(keywords)],
    sourceEventPage: canonicalEventUrl(
      `https://www.meetup.com/${path.group}/events/${path.eventId}`,
    ),
  }
}

export const meetupStrategy: EventPageStrategy = {
  id: "meetup.com",
  label: "Meetup",

  matchesHost(hostname: string): boolean {
    const h = hostname.toLowerCase()
    return h === "meetup.com" || h.endsWith(".meetup.com")
  },

  extract(doc: Document, url: URL): StrategyOutcome {
    const path = parseMeetupEventPath(url.pathname)
    if (!path) {
      return {
        kind: "not-event",
        message: "Open a specific Meetup event (meetup.com/<group>/events/<id>) to suggest it.",
      }
    }
    return { kind: "event", event: extractMeetupEvent(doc, path) }
  },
}
