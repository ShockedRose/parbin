import { bevyStrategy } from "./bevy"
import { meetupStrategy } from "./meetup"
import type { EventPageStrategy } from "./types"

/** Add new site strategies here; the first match wins. */
export const strategies: EventPageStrategy[] = [meetupStrategy, bevyStrategy]

export function findStrategy(hostname: string): EventPageStrategy | undefined {
  return strategies.find((strategy) => strategy.matchesHost(hostname))
}
