import { Outlet } from "@tanstack/react-router"

import { AppFooter } from "@/components/app-footer"
import { AppHeader } from "@/components/app-header"
import { StatusBanner } from "@/components/status-banner"
import { EventManagerContext } from "@/event-manager-context"
import { useEventManager } from "@/hooks/use-event-manager"

export function AppShell() {
  const mgr = useEventManager()

  return (
    <EventManagerContext.Provider value={mgr}>
      <div className="relative min-h-screen bg-background font-sans text-foreground">
        <div className="parbin-shell-edges" aria-hidden />
        <div className="parbin-shell-grid" aria-hidden />

        <AppHeader adminEmail={mgr.admin?.email} />

        <main className="relative mx-auto min-w-0 max-w-7xl px-6 py-10">
          {mgr.error && <StatusBanner message={mgr.error} variant="error" />}
          {mgr.notice && <StatusBanner message={mgr.notice} variant="notice" />}
          <Outlet />
        </main>

        <AppFooter />
      </div>
    </EventManagerContext.Provider>
  )
}
