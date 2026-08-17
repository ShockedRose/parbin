import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEventManagerContext } from "@/event-manager-context"
import { LogIn, Shield } from "lucide-react"

export function AdminLoginCard() {
  const mgr = useEventManagerContext()

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8">
      <div className="mb-6 flex items-center gap-2 text-[11px] text-accent uppercase">
        <Shield className="h-4 w-4" />
        AUTH_REQUIRED
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-[11px] text-primary uppercase">
            admin.email
          </Label>
          <Input
            type="email"
            value={mgr.loginForm.email}
            onChange={(e) => mgr.updateLoginField("email", e.target.value)}
            placeholder=">> admin@parbin.local"
            className="border-border bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] text-primary uppercase">
            admin.password
          </Label>
          <Input
            type="password"
            value={mgr.loginForm.password}
            onChange={(e) => mgr.updateLoginField("password", e.target.value)}
            placeholder=">> Enter password"
            className="border-border bg-background"
          />
        </div>

        <Button
          onClick={() => {
            void mgr.login()
          }}
          className="w-full text-[11px] uppercase"
          size="lg"
          disabled={
            mgr.isAuthenticating ||
            !mgr.loginForm.email ||
            !mgr.loginForm.password
          }
        >
          <LogIn className="mr-2 h-4 w-4" />
          {mgr.isAuthenticating ? "AUTHENTICATING..." : "LOGIN_ADMIN"}
        </Button>
      </div>
    </div>
  )
}
