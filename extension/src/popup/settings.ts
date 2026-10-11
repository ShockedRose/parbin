import { ext } from "./browser"

export const DEFAULT_API_BASE_URL = "http://localhost:8080"
const API_BASE_URL_KEY = "apiBaseUrl"

/** Returns a base URL without trailing slash, or throws with a user-facing message. */
export function normalizeApiBaseUrl(raw: string): string {
  const value = raw.trim()
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error("Enter a full URL, e.g. https://api.parbin.example")
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("The backend URL must start with http:// or https://")
  }
  return `${url.origin}${url.pathname}`.replace(/\/+$/, "")
}

export async function loadApiBaseUrl(): Promise<string> {
  const stored = await ext.storage.sync.get(API_BASE_URL_KEY)
  const value = stored[API_BASE_URL_KEY]
  return typeof value === "string" && value ? value : DEFAULT_API_BASE_URL
}

export async function saveApiBaseUrl(value: string): Promise<void> {
  await ext.storage.sync.set({ [API_BASE_URL_KEY]: value })
}
