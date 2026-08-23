import { SCRAPED_TAG } from "../types.js"

export type CatalogTag = {
  id: string
  name: string
}

/** Matches backend `maxEventTags` / frontend `MAX_EVENT_TAGS`. */
export const MAX_EVENT_TAGS = 6

export function tagKey(name: string): string {
  return name.trim().toLowerCase()
}

export function findCatalogMatch(
  catalog: CatalogTag[],
  query: string,
): CatalogTag | undefined {
  const key = tagKey(query)
  if (!key) {
    return undefined
  }
  return catalog.find((tag) => tagKey(tag.name) === key)
}

export function scrapedTagName(catalog: CatalogTag[]): string {
  return findCatalogMatch(catalog, SCRAPED_TAG)?.name ?? SCRAPED_TAG
}

function tagMentionedInText(text: string, name: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, "i").test(text)
}

/** Catalog names (except `scraped`) that appear in title/description. Longer names first. */
export function catalogTagsFromText(catalog: CatalogTag[], text: string): string[] {
  const scrapedKey = tagKey(SCRAPED_TAG)
  const matches: { name: string; length: number }[] = []

  for (const tag of catalog) {
    const name = tag.name.trim()
    if (!name || tagKey(name) === scrapedKey) {
      continue
    }
    if (tagMentionedInText(text, name)) {
      matches.push({ name, length: name.length })
    }
  }

  matches.sort((a, b) => b.length - a.length)
  return matches.map((m) => m.name)
}

/**
 * Guest-style tags: only catalog names, plus the reserved `scraped` marker.
 * Uses the catalog's exact spelling when a case-insensitive match exists.
 */
export function resolveSuggestionTags(
  catalog: CatalogTag[],
  payloadTags: string[],
  title: string,
  description: string,
): string[] {
  const scraped = scrapedTagName(catalog)
  const scrapedKey = tagKey(scraped)
  const seen = new Set<string>()
  const resolved: string[] = []

  const addCatalogName = (raw: string) => {
    const match = findCatalogMatch(catalog, raw)
    if (!match) {
      return
    }
    const key = tagKey(match.name)
    if (seen.has(key) || key === scrapedKey) {
      return
    }
    seen.add(key)
    resolved.push(match.name)
  }

  for (const tag of payloadTags) {
    addCatalogName(tag)
  }
  for (const tag of catalogTagsFromText(catalog, `${title}\n${description}`)) {
    addCatalogName(tag)
  }

  return [...resolved.slice(0, MAX_EVENT_TAGS - 1), scraped]
}
