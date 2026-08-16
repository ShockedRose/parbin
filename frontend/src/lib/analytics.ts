import { isPostHogEnabled, posthog } from "@/lib/posthog"

export const AnalyticsEvent = {
  SuggestionSubmitted: "suggestion_submitted",
  EventCreated: "event_created",
  EventUpdated: "event_updated",
  EventViewed: "event_viewed",
  SuggestionApproved: "suggestion_approved",
  SuggestionRejected: "suggestion_rejected",
  AdminLoggedIn: "admin_logged_in",
  AdminLoggedOut: "admin_logged_out",
  CalendarGoogleOpened: "calendar_google_opened",
  CalendarIcsDownloaded: "calendar_ics_downloaded",
} as const

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent]

export function trackEvent(
  event: AnalyticsEventName | "$pageview",
  properties?: Record<string, unknown>
) {
  if (!isPostHogEnabled) return
  posthog.capture(event, properties)
}

export function identifyAdmin(admin: { id: string; email: string }) {
  if (!isPostHogEnabled) return
  posthog.identify(admin.id, { email: admin.email })
}

export function resetAnalytics() {
  if (!isPostHogEnabled) return
  posthog.reset()
}
