import posthog from "posthog-js"

const token = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim()
const host =
  import.meta.env.VITE_POSTHOG_HOST?.trim() || "https://us.i.posthog.com"

export const isPostHogEnabled = Boolean(token)

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
