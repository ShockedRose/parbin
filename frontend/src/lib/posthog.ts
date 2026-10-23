import posthog from "posthog-js"

import { isProduction } from "@/lib/env"

const token = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim()
const host =
  import.meta.env.VITE_POSTHOG_HOST?.trim() || "https://us.i.posthog.com"

/**
 * PostHog runs only in production builds with a configured project token.
 * Local development and preview environments stay untracked.
 */
export const isPostHogEnabled = isProduction && Boolean(token)

if (isPostHogEnabled && token) {
  posthog.init(token, {
    api_host: host,
    defaults: "2026-05-30",
    // TanStack Router is an SPA — pageviews are captured manually.
    capture_pageview: false,
    person_profiles: "identified_only",
  })
}

export { posthog }
