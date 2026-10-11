import type { CatalogTag } from "../shared/types"

/** Matches backend `maxEventTags`. */
export const MAX_EVENT_TAGS = 6

function tagKey(name: string): string {
  return name.trim().toLowerCase()
}

export function findCatalogMatch(catalog: CatalogTag[], query: string): CatalogTag | undefined {
  const key = tagKey(query)
  return key ? catalog.find((tag) => tagKey(tag.name) === key) : undefined
}

function mentionedInText(text: string, name: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, "i").test(text)
}

/**
 * Guest suggestions only use existing catalog tags (same as the web suggest form):
 * page keywords first, then catalog names mentioned in the title/description.
 */
export function suggestTags(
  catalog: CatalogTag[],
  keywords: string[],
  title: string,
  description: string,
): string[] {
  const picked: string[] = []
  const add = (name: string) => {
    const match = findCatalogMatch(catalog, name)
    if (match && !picked.some((p) => tagKey(p) === tagKey(match.name))) picked.push(match.name)
  }

  for (const keyword of keywords) add(keyword)

  const text = `${title}\n${description}`
  const mentioned = catalog
    .map((tag) => tag.name.trim())
    .filter((name) => name && mentionedInText(text, name))
    .sort((a, b) => b.length - a.length)
  for (const name of mentioned) add(name)

  return picked.slice(0, MAX_EVENT_TAGS)
}
