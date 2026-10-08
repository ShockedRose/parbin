import { Outlet } from "@tanstack/react-router"

import { AppFooter } from "@/components/app-footer"
import { AppHeader } from "@/components/app-header"
import { PostHogPageviewTracker } from "@/components/posthog-pageview-tracker"
import { StatusBanner } from "@/components/status-banner"
import { EventManagerContext } from "@/event-manager-context"
import { useEventManager } from "@/hooks/use-event-manager"

export function AppShell() {
  const mgr = useEventManager()

  return (
    <EventManagerContext.Provider value={mgr}>
      <PostHogPageviewTracker />
      <div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground">
        <div className="parbin-backdrop" aria-hidden />

        <AppHeader adminEmail={mgr.admin?.email} />

        <main className="relative mx-auto w-full max-w-7xl min-w-0 flex-1 px-6 py-10">
          {mgr.error && <StatusBanner message={mgr.error} variant="error" />}
          {mgr.notice && <StatusBanner message={mgr.notice} variant="notice" />}
          <Outlet />
        </main>

        <AppFooter />
      </div>
    </EventManagerContext.Provider>
  )
}
