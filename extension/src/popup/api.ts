import type { CatalogTag, SuggestionPayload } from "../shared/types"

export class ApiError extends Error {}

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    })
  } catch {
    throw new ApiError(
      `Could not reach ${baseUrl}. Check that the backend is running and that CORS_ALLOW_BROWSER_EXTENSIONS is not disabled.`,
    )
  }

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`.trim()
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      /* non-JSON error body */
    }
    if (res.status === 403) {
      message = "The backend rejected this extension's origin (CORS_ALLOW_BROWSER_EXTENSIONS=false?)"
    }
    throw new ApiError(message)
  }

  return (await res.json()) as T
}

export async function checkHealth(baseUrl: string): Promise<void> {
  await request<{ status: string }>(baseUrl, "/healthz")
}

export async function fetchCatalogTags(baseUrl: string): Promise<CatalogTag[]> {
  const data = await request<{ tags?: CatalogTag[] }>(baseUrl, "/api/tags")
  return (data.tags ?? []).filter((tag) => typeof tag?.name === "string" && tag.name.trim() !== "")
}

export async function fetchKnownSourceUrls(baseUrl: string): Promise<Set<string>> {
  const data = await request<{ urls?: string[] }>(baseUrl, "/api/event-suggestions/source-urls")
  return new Set(data.urls ?? [])
}

export async function submitSuggestion(baseUrl: string, payload: SuggestionPayload): Promise<void> {
  await request(baseUrl, "/api/event-suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}
