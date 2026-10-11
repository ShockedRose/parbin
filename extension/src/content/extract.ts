import type { ExtractionResult } from "../shared/types"
import { findStrategy } from "./strategies/registry"

export function extractCurrentPage(): ExtractionResult {
  try {
    const url = new URL(location.href)
    const strategy = findStrategy(url.hostname)
    if (!strategy) return { status: "unsupported", hostname: url.hostname }

    const info = { id: strategy.id, label: strategy.label }
    const outcome = strategy.extract(document, url)
    if (outcome.kind === "not-event") {
      return { status: "not-event", strategy: info, message: outcome.message }
    }
    return { status: "ok", strategy: info, event: outcome.event }
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : String(err) }
  }
}
