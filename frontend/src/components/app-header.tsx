import { Link, useRouterState } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { LanguageSwitcher } from "@/components/language-switcher"
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
  to: "/" | "/past-events" | "/suggest" | "/admin" | "/admin/dashboard"
  labelKey: string
  descriptionKey: string
  adminOnly?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    to: "/",
    labelKey: "nav.upcoming",
    descriptionKey: "nav.upcomingDescription",
  },
  {
    to: "/past-events",
    labelKey: "nav.pastEvents",
    descriptionKey: "nav.pastEventsDescription",
  },
  {
    to: "/admin",
    labelKey: "nav.admin",
    descriptionKey: "nav.adminDescription",
  },
  {
    to: "/admin/dashboard",
    labelKey: "nav.dashboard",
    descriptionKey: "nav.dashboardDescription",
    adminOnly: true,
  },
]

const suggestItem: NavigationItem = {
  to: "/suggest",
  labelKey: "nav.suggest",
  descriptionKey: "nav.suggestDescription",
}

function useCurrentPathname() {
  return useRouterState({
    select: (state) => state.location.pathname,
  })
}

function Logo() {
  const { t } = useTranslation()

  return (
    <Link to="/" className="flex items-center gap-3">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-border bg-card"
        aria-hidden
      >
        <span className="h-3 w-3 rounded-full bg-accent" />
      </span>
      <span className="leading-tight">
        <span className="block font-serif text-xl font-semibold">
          {t("common.appName")}
        </span>
        <span className="hidden text-xs text-muted-foreground sm:block">
          {t("common.tagline")}
        </span>
      </span>
    </Link>
  )
}

export function AppHeader({ adminEmail }: { adminEmail?: string | null }) {
  const { t } = useTranslation()
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
                  {t(item.labelKey)}
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
            <LanguageSwitcher />
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
                {t(suggestItem.labelKey)}
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl px-3"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu />
              {t("common.menu")}
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="border-border bg-card p-0">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="font-serif text-xl">
              {t("common.appName")}
            </SheetTitle>
            <SheetDescription>
              {adminEmail
                ? t("common.signedInAs", { email: adminEmail })
                : t("common.tagline")}
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
                    {t(item.labelKey)}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {t(item.descriptionKey)}
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
