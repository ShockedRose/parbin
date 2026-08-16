import { useRouterState } from "@tanstack/react-router"
import { useEffect } from "react"

import { trackEvent } from "@/lib/analytics"
import { isPostHogEnabled } from "@/lib/posthog"

/** Captures `$pageview` on TanStack Router location changes. */
export function PostHogPageviewTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const search = useRouterState({ select: (s) => s.location.searchStr })

  useEffect(() => {
    if (!isPostHogEnabled) return
    trackEvent("$pageview", {
      $current_url: window.location.href,
      path: pathname,
    })
  }, [pathname, search])

  return null
}
