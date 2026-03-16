import { Link, Outlet, useRouterState } from "@tanstack/react-router"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { EventManagerContext } from "@/event-manager-context"
import { useEventManager } from "@/hooks/use-event-manager"
import { cn } from "@/lib/utils"
import {
  PanelLeft,
  Send,
  Terminal,
  type LucideIcon,
  Zap,
} from "lucide-react"

type NavigationItem = {
  to: "/" | "/suggest" | "/admin"
  label: string
  description: string
  icon: LucideIcon
  accent: "primary" | "accent"
}

const navigationItems: NavigationItem[] = [
  {
    to: "/",
    label: "Feed",
    description: "Browse active meetup signals",
    icon: Zap,
    accent: "primary",
  },
  {
    to: "/suggest",
    label: "Suggest",
    description: "Send an event for review",
    icon: Send,
    accent: "primary",
  },
  {
    to: "/admin",
    label: "Admin",
    description: "Manage sessions and approvals",
    icon: Terminal,
    accent: "accent",
  },
]

function useCurrentPathname() {
  return useRouterState({
    select: (state) => state.location.pathname,
  })
}

function getNavigationItem(pathname: string) {
  return navigationItems.find((item) => item.to === pathname) ?? navigationItems[0]
}

function StatusBanner({
  message,
  variant,
}: {
  message: string
  variant: "error" | "notice"
}) {
  const tone =
    variant === "error"
      ? "border-accent/40 bg-accent/10 text-accent"
      : "border-primary/40 bg-primary/10 text-primary"

  return (
    <div className={`mb-6 border px-4 py-3 text-xs tracking-wide ${tone}`}>
      {message}
    </div>
  )
}

function NavigationLink({
  item,
  mobile = false,
  onSelect,
}: {
  item: NavigationItem
  mobile?: boolean
  onSelect?: () => void
}) {
  const pathname = useCurrentPathname()
  const isActive = pathname === item.to
  const Icon = item.icon

  const activeClasses =
    item.accent === "accent"
      ? "border-accent bg-accent/12 text-accent shadow-[0_0_18px_rgba(255,45,74,0.18)]"
      : "border-primary bg-primary/12 text-primary shadow-[0_0_18px_rgba(53,128,255,0.18)]"

  const inactiveClasses =
    item.accent === "accent"
      ? "border-border bg-card/60 text-foreground/85 hover:border-accent/60 hover:bg-accent/6"
      : "border-border bg-card/60 text-foreground/85 hover:border-primary/60 hover:bg-primary/6"

  const detailClasses = isActive
    ? item.accent === "accent"
      ? "text-accent/80"
      : "text-primary/80"
    : "text-muted-foreground transition-colors group-hover:text-foreground/75"

  return (
    <Link
      to={item.to}
      onClick={() => onSelect?.()}
      className={cn(
        "group border transition-all",
        mobile
          ? "flex items-start gap-3 px-4 py-3"
          : "flex min-w-44 items-start gap-3 px-4 py-3",
        isActive ? activeClasses : inactiveClasses
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          isActive ? "text-current" : "text-muted-foreground"
        )}
      />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-[0.24em]">
          {item.label}
        </div>
        <div className={cn("mt-1 text-[10px] tracking-[0.16em]", detailClasses)}>
          {item.description}
        </div>
      </div>
    </Link>
  )
}

export function AppShell() {
  const mgr = useEventManager()
  const pathname = useCurrentPathname()
  const activeItem = getNavigationItem(pathname)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

        <header className="relative border-b border-border px-6 py-4">
          <div
            className="absolute inset-x-0 bottom-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #3580FF, rgba(255,255,255,0.25), #FF2D4A, transparent)",
              opacity: 0.6,
            }}
          />
          <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <Link to="/">
              <div>
                <h1 className="font-display text-xl font-extrabold tracking-[0.25em] text-primary sm:text-2xl">
                  PAR<span className="text-accent">BIN</span>
                </h1>
                <p className="text-[10px] tracking-[0.2em] text-muted-foreground">
                  ▸ TECH MEETUPS · PANAMÁ
                </p>
              </div>
            </Link>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              {mgr.admin && (
                <div className="text-[10px] tracking-[0.2em] text-primary">
                  ADMIN ONLINE // {mgr.admin.email}
                </div>
              )}

              <div className="flex w-full items-center gap-3 sm:hidden">
                <Button
                  variant="outline"
                  className="border-primary/40 bg-card/80 px-3 text-[10px] uppercase tracking-[0.24em]"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <PanelLeft className="h-3.5 w-3.5" />
                  Menu
                </Button>
                <div className="border border-border bg-card/70 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-foreground">
                  {activeItem.label}
                </div>
              </div>

              <nav className="hidden flex-wrap gap-3 sm:flex">
                {navigationItems.map((item) => (
                  <NavigationLink key={item.to} item={item} />
                ))}
              </nav>
            </div>
          </div>
        </header>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="border-border bg-card/95 p-0">
            <SheetHeader className="border-b border-border px-5 py-4">
              <SheetTitle className="font-display text-xl uppercase tracking-[0.22em] text-primary">
                Route Menu
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase tracking-[0.18em]">
                Switch between feed, suggestion form, and admin.
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-3 p-5">
              {navigationItems.map((item) => (
                <NavigationLink
                  key={item.to}
                  item={item}
                  mobile
                  onSelect={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <main className="relative mx-auto max-w-7xl px-6 py-10">
          {mgr.error && <StatusBanner message={mgr.error} variant="error" />}
          {mgr.notice && <StatusBanner message={mgr.notice} variant="notice" />}
          <Outlet />
        </main>

        <footer className="border-t border-border px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <p className="text-[10px] tracking-[0.2em] text-muted-foreground">
              PARBIN // PANAMÁ
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <p className="text-[10px] tracking-[0.2em] text-primary">
                SYSTEM ONLINE
              </p>
            </div>
          </div>
        </footer>
      </div>
    </EventManagerContext.Provider>
  )
}
