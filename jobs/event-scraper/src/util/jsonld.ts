import type { Page } from "playwright"

function flattenLd(node: unknown, acc: Record<string, unknown>[]): void {
  if (node === null || node === undefined) return
  if (Array.isArray(node)) {
    for (const item of node) flattenLd(item, acc)
    return
  }
  if (typeof node === "object") {
    const o = node as Record<string, unknown>
    if (o["@graph"]) {
      flattenLd(o["@graph"], acc)
    }
    const type = o["@type"]
    const types = Array.isArray(type) ? type : type ? [type] : []
    if (types.some((t) => String(t).toLowerCase() === "event")) {
      acc.push(o)
    }
    return
  }
}

export async function extractEventObjectsFromJsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const raw = await page.evaluate(() => {
    const out: unknown[] = []
    for (const el of document.querySelectorAll('script[type="application/ld+json"]')) {
      const text = el.textContent?.trim()
      if (!text) continue
      try {
        out.push(JSON.parse(text))
      } catch {
        /* ignore */
      }
    }
    return out
  })

  const events: Record<string, unknown>[] = []
  for (const chunk of raw) flattenLd(chunk, events)
  return events
}

export function firstString(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim()
  }
  return ""
}
