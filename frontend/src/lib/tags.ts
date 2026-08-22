import type { CatalogTag } from "@/types/event"

export const MAX_EVENT_TAGS = 6
export const TAG_SUGGESTION_LIMIT = 8

export function normalizeTagName(name: string): string {
  return name.trim()
}

export function tagKey(name: string): string {
  return normalizeTagName(name).toLowerCase()
}

export function findCatalogMatch(
  catalog: CatalogTag[],
  query: string
): CatalogTag | undefined {
  const key = tagKey(query)
  if (!key) {
    return undefined
  }

  return catalog.find((tag) => tagKey(tag.name) === key)
}

export function isTagSelected(selected: string[], name: string): boolean {
  const key = tagKey(name)
  return selected.some((tag) => tagKey(tag) === key)
}

export function filterTagSuggestions(
  catalog: CatalogTag[],
  selected: string[],
  query: string
): CatalogTag[] {
  const needle = tagKey(query)

  return catalog
    .filter((tag) => {
      if (isTagSelected(selected, tag.name)) {
        return false
      }
      if (!needle) {
        return true
      }
      return tagKey(tag.name).includes(needle)
    })
    .slice(0, TAG_SUGGESTION_LIMIT)
}

export function canCreateTag(
  catalog: CatalogTag[],
  selected: string[],
  query: string
): boolean {
  const name = normalizeTagName(query)
  if (!name || selected.length >= MAX_EVENT_TAGS) {
    return false
  }
  if (isTagSelected(selected, name) || findCatalogMatch(catalog, name)) {
    return false
  }
  return true
}
