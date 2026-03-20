import { Link, useRouterState } from "@tanstack/react-router"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { PanelLeft, Send, Terminal, type LucideIcon, Zap } from "lucide-react"

type NavigationItem = {
  to: "/" | "/suggest" | "/admin"
  label: string
  description: string
  icon: LucideIcon
}

const navigationItems: NavigationItem[] = [
  {
    to: "/",
    label: "Feed",
    description: "Browse active meetup signals",
    icon: Zap,
  },
  {
    to: "/suggest",
    label: "Suggest",
    description: "Suggest your event",
    icon: Send,
  },
  {
    to: "/admin",
    label: "Admin",
    description: "Manage sessions and approvals",
    icon: Terminal,
  },
]

function useCurrentPathname() {
  return useRouterState({
    select: (state) => state.location.pathname,
  })
}

function getNavigationItem(pathname: string) {
  return (
    navigationItems.find((item) => item.to === pathname) ?? navigationItems[0]
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
    "border-primary bg-primary/10 text-primary parbin-glow-primary"

  const inactiveClasses =
    "border-white/15 bg-secondary/80 text-foreground/90 hover:border-primary/45 hover:bg-card"

  const detailClasses = isActive
    ? "text-primary/90"
    : "text-muted-foreground transition-colors group-hover:text-primary/70"

  return (
    <Link
      to={item.to}
      onClick={() => onSelect?.()}
      className={cn(
        "group rounded-xl border transition-all",
        mobile
          ? "flex items-start gap-3 px-4 py-3"
          : "flex h-[4.25rem] w-44 shrink-0 items-center gap-2.5 px-3 py-2 lg:h-[5.5rem] lg:w-60 lg:gap-3 lg:px-4 lg:py-3",
        isActive ? activeClasses : inactiveClasses
      )}
    >
      <Icon
        className={cn(
          "h-6 w-6 shrink-0 lg:h-8 lg:w-8",
          isActive ? "text-current" : "font-light"
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold uppercase lg:text-base">
          {item.label}
        </div>
        <div
          className={cn(
            "text-[10px] leading-tight font-light sm:line-clamp-2 lg:text-xs lg:leading-snug",
            detailClasses
          )}
        >
          {item.description}
        </div>
      </div>
    </Link>
  )
}

export function AppHeader({ adminEmail }: { adminEmail?: string | null }) {
  const pathname = useCurrentPathname()
  const activeItem = getNavigationItem(pathname)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="relative border-b border-border px-6 py-4">
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 70%, transparent), rgba(255,255,255,0.2), color-mix(in srgb, var(--accent) 75%, transparent), transparent)",
            opacity: 0.65,
          }}
        />
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <Link to="/">
            <div className="flex items-start gap-2.5">
              <span
                className="mt-1.5 inline-flex h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_10px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
                aria-hidden
              />
              <div>
                <h1 className="font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                  PARBIN
                </h1>
                <p className="text-[10px] tracking-wide">
                  <span className="text-foreground/90">TECH MEETUPS</span>
                  <span className="text-foreground/35"> · </span>
                  <span className="text-primary">PANAMÁ</span>
                </p>
              </div>
            </div>
          </Link>
          {adminEmail && (
            <div className="text-[10px] tracking-wide text-primary">
              ADMIN ONLINE // {adminEmail}
            </div>
          )}
        </div>
        <div className="mx-auto mt-6 flex w-full max-w-7xl flex-col items-center gap-3 sm:mt-8 lg:mt-10">
          <div className="flex w-full items-center justify-start gap-3 sm:hidden">
            <Button
              variant="outline"
              className="border-primary bg-card px-3 text-[10px] uppercase"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <PanelLeft className="h-3.5 w-3.5" />
              Menu
            </Button>
            <div className="border border-border bg-card px-3 py-2 text-[10px] text-foreground uppercase">
              {activeItem.label}
            </div>
          </div>

          <nav className="hidden w-full flex-nowrap justify-center gap-2 sm:flex lg:gap-3">
            {navigationItems.map((item) => (
              <NavigationLink key={item.to} item={item} />
            ))}
          </nav>
        </div>
      </header>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="border-border bg-card/95 p-0">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="font-display text-xl text-primary uppercase">
              Menu
            </SheetTitle>
            <SheetDescription className="text-[10px] uppercase">
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
    </>
  )
}
