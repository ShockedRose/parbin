import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEventManagerContext } from "@/event-manager-context"
import { LogIn } from "lucide-react"

export function AdminLoginCard() {
  const { t } = useTranslation()
  const mgr = useEventManagerContext()

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="font-serif text-xl font-semibold">
        {t("pages.login.title")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("pages.login.description")}
      </p>

      <form
        className="mt-6 space-y-5"
        onSubmit={(submitEvent) => {
          submitEvent.preventDefault()
          void mgr.login()
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="admin-email">{t("pages.login.email")}</Label>
          <Input
            id="admin-email"
            type="email"
            autoComplete="email"
            value={mgr.loginForm.email}
            onChange={(e) => mgr.updateLoginField("email", e.target.value)}
            placeholder="admin@parbin.local"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password">{t("pages.login.password")}</Label>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={mgr.loginForm.password}
            onChange={(e) => mgr.updateLoginField("password", e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-xl text-[15px]"
          disabled={
            mgr.isAuthenticating ||
            !mgr.loginForm.email ||
            !mgr.loginForm.password
          }
        >
          <LogIn />
          {mgr.isAuthenticating
            ? t("pages.login.signingIn")
            : t("pages.login.signIn")}
        </Button>
      </form>
    </div>
  )
}
