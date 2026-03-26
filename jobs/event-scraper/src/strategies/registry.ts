import { cncfCommunityStrategy, gdgCommunityStrategy } from "./community-chapter.js"
import { eventbriteStrategy } from "./eventbrite.js"
import { lumaStrategy } from "./luma.js"
import { meetupStrategy } from "./meetup.js"
import type { ScrapeStrategy } from "./types.js"
import { hostnameKey } from "../util/url.js"

/** More specific hosts first so `gdg.community.dev` wins over a hypothetical broader `community.dev` rule. */
const strategies: ScrapeStrategy[] = [
  cncfCommunityStrategy,
  gdgCommunityStrategy,
  meetupStrategy,
  eventbriteStrategy,
  lumaStrategy,
]

export function strategyForHost(hostname: string): ScrapeStrategy | null {
  const key = hostnameKey(hostname)
  for (const s of strategies) {
    if (s.matchesHost(key)) return s
  }
  return null
}

export function strategyForSourceDomain(domain: string): ScrapeStrategy | null {
  return strategyForHost(domain)
}
