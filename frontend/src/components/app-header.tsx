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
import { Menu, Plus } from "lucide-react"

type NavigationItem = {
  to: "/" | "/suggest" | "/admin" | "/admin/dashboard"
  label: string
  description: string
  adminOnly?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    to: "/",
    label: "Upcoming",
    description: "Events and the monthly calendar",
  },
  {
    to: "/admin",
    label: "Admin",
    description: "Create events and review suggestions",
  },
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    description: "Catalog and moderation charts",
    adminOnly: true,
  },
]

const suggestItem: NavigationItem = {
  to: "/suggest",
  label: "Suggest an event",
  description: "Send a meetup for review",
}

function useCurrentPathname() {
  return useRouterState({
    select: (state) => state.location.pathname,
  })
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-border bg-card"
        aria-hidden
      >
        <span className="h-3 w-3 rounded-full bg-accent" />
      </span>
      <span className="leading-tight">
        <span className="block font-serif text-xl font-semibold">Parbin</span>
        <span className="block text-xs text-muted-foreground">
          Tech meetups in Panamá
        </span>
      </span>
    </Link>
  )
}

export function AppHeader({ adminEmail }: { adminEmail?: string | null }) {
  const pathname = useCurrentPathname()
  const isAdmin = Boolean(adminEmail)
  const navItems = navigationItems.filter((item) => !item.adminOnly || isAdmin)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="relative border-b border-border/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-[15px] font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  {isActive ? (
                    <span className="absolute inset-x-3 -bottom-[17px] h-0.5 rounded-full bg-accent" />
                  ) : null}
                </Link>
              )
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {adminEmail ? (
              <span className="max-w-48 truncate text-xs text-muted-foreground">
                {adminEmail}
              </span>
            ) : null}
            <Button
              asChild
              variant="outline"
              size="lg"
              className={cn(
                "rounded-xl px-4 hover:border-accent/60 hover:text-foreground",
                pathname === suggestItem.to && "border-accent/60"
              )}
            >
              <Link to={suggestItem.to}>
                <Plus />
                {suggestItem.label}
              </Link>
            </Button>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="rounded-xl px-3 md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu />
            Menu
          </Button>
        </div>
      </header>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="border-border bg-card p-0">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="font-serif text-xl">Parbin</SheetTitle>
            <SheetDescription>
              {adminEmail ? `Signed in as ${adminEmail}` : "Tech meetups in Panamá"}
            </SheetDescription>
          </SheetHeader>

          <nav className="flex flex-col gap-1 p-3">
            {[...navItems, suggestItem].map((item) => {
              const isActive = pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3 transition-colors",
                    isActive ? "bg-muted" : "hover:bg-muted/60"
                  )}
                >
                  <span className="flex items-center gap-2 font-medium">
                    {isActive ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    ) : null}
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
