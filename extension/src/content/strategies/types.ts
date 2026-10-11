import type { ExtractedEvent } from "../../shared/types"

export type StrategyOutcome =
  | { kind: "event"; event: ExtractedEvent }
  | { kind: "not-event"; message: string }

/**
 * One implementation per events site. Runs inside the page (content script
 * isolated world), so it can read the DOM but not the page's JS globals.
 */
export interface EventPageStrategy {
  /** Stable key, e.g. `meetup.com`. */
  id: string
  /** Human-readable site name shown in the popup. */
  label: string
  matchesHost(hostname: string): boolean
  extract(doc: Document, url: URL): StrategyOutcome
}
