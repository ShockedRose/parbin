/** Stable URL string for deduplication (matches what we send as sourceEventPage). */
export function canonicalEventUrl(href: string): string {
  try {
    const u = new URL(href)
    u.hash = ""
    u.hostname = u.hostname.toLowerCase()
    if ((u.protocol === "http:" && u.port === "80") || (u.protocol === "https:" && u.port === "443")) {
      u.port = ""
    }
    const path = u.pathname.replace(/\/+$/, "") || "/"
    u.pathname = path
    return u.toString()
  } catch {
    return href.trim()
  }
}

export function hostnameKey(host: string): string {
  const h = host.toLowerCase()
  if (h.startsWith("www.")) return h.slice(4)
  return h
}
