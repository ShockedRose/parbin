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
      <div className="relative min-h-screen bg-background font-mono text-foreground">
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, #3580FF 25%, #3580FF 26%, transparent 27%, transparent 74%, #3580FF 75%, #3580FF 76%, transparent 77%), linear-gradient(90deg, transparent 24%, #3580FF 25%, #3580FF 26%, transparent 27%, transparent 74%, #3580FF 75%, #3580FF 76%, transparent 77%)",
            backgroundSize: "60px 60px",
          }}
        />

        <AppHeader adminEmail={mgr.admin?.email} />

        <main className="relative mx-auto max-w-7xl px-6 py-10">
          {mgr.error && <StatusBanner message={mgr.error} variant="error" />}
          {mgr.notice && <StatusBanner message={mgr.notice} variant="notice" />}
          <Outlet />
        </main>

        <AppFooter />
      </div>
    </EventManagerContext.Provider>
  )
}
