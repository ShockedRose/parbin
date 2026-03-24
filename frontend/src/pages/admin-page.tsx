import { useNavigate } from "@tanstack/react-router"

import { EventFormPanel } from "@/components/event-form-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEventManagerContext } from "@/event-manager-context"
import { formatDateRange } from "@/lib/calendar"
import {
  Calendar,
  Check,
  ExternalLink,
  LogIn,
  LogOut,
  MapPin,
  Plus,
  Shield,
  X,
} from "lucide-react"

export function AdminPage() {
  const mgr = useEventManagerContext()
  const navigate = useNavigate()

  const handleAddEvent = async () => {
    const wasCreated = await mgr.addEvent()

    if (wasCreated) {
      await navigate({ to: "/" })
    }
  }

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <div className="mb-1 text-[10px] text-muted-foreground">
          ▸ ADMIN_CONSOLE // RESTRICTED ACCESS
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
          <span className="text-foreground">CONTROL_</span>
          <span className="text-primary">PANEL</span>
        </h2>
      </div>

      {!mgr.admin ? (
        <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8">
          <div className="mb-6 flex items-center gap-2 text-[11px] text-accent uppercase">
            <Shield className="h-4 w-4" />
            AUTH_REQUIRED
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[11px]  text-primary uppercase">
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
              <Label className="text-[11px]  text-primary uppercase">
                admin.password
              </Label>
              <Input
                type="password"
                value={mgr.loginForm.password}
                onChange={(e) =>
                  mgr.updateLoginField("password", e.target.value)
                }
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
      ) : (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[10px] text-primary">
                  ADMIN_SESSION_ACTIVE
                </div>
                <div className="mt-1 text-sm text-foreground">
                  {mgr.admin.email}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  void mgr.logout()
                }}
                disabled={mgr.isAuthenticating}
                className="text-[10px] uppercase"
              >
                <LogOut className="mr-2 h-3 w-3" />
                {mgr.isAuthenticating ? "CLOSING..." : "LOGOUT"}
              </Button>
            </div>

            <EventFormPanel
              title="EVENT_CREATION_PIPELINE"
              accent="var(--accent)"
              form={mgr.eventForm}
              preview={mgr.eventImagePreview}
              submitLabel="DEPLOY_EVENT"
              submitIcon={<Plus className="mr-2 h-4 w-4" />}
              busy={mgr.isSubmitting}
              disabled={mgr.isSubmitting}
              onFieldChange={mgr.updateEventField}
              onSubmit={() => {
                void handleAddEvent()
              }}
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] text-accent">
                  REVIEW_QUEUE
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Pending suggestions can be converted directly into events.
                </div>
              </div>
              <div className="text-[10px] text-primary">
                {mgr.suggestions.length} ITEMS
              </div>
            </div>

            {mgr.isSuggestionsLoading ? (
              <div className="border border-border px-4 py-8 text-center text-[11px] text-primary">
                LOADING_QUEUE...
              </div>
            ) : mgr.suggestions.length === 0 ? (
              <div className="border border-border px-4 py-8 text-center text-[11px] text-muted-foreground">
                NO_SUGGESTIONS_AVAILABLE
              </div>
            ) : (
              <div className="space-y-4">
                {mgr.suggestions.map((suggestion) => {
                  const isBusy = mgr.activeSuggestionId === suggestion.id
                  const isPending = suggestion.status === "pending"

                  return (
                    <div
                      key={suggestion.id}
                      className="rounded-lg border border-border bg-background p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-lg">
                            {suggestion.title}
                          </h3>
                          <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-primary" />
                              {formatDateRange(
                                suggestion.date,
                                suggestion.endDate
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-accent" />
                              {suggestion.location || "No location provided"}
                            </div>
                            {suggestion.sourceEventPage ? (
                              <div className="flex min-w-0 items-start gap-1.5">
                                <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                                <a
                                  href={suggestion.sourceEventPage}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="min-w-0 break-all text-primary underline-offset-2 hover:underline"
                                >
                                  {suggestion.sourceEventPage}
                                </a>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className={
                            suggestion.status === "pending"
                              ? "border-primary/40 text-primary"
                              : suggestion.status === "approved"
                                ? "border-green-500/40 text-green-300"
                                : "border-accent/40 text-accent"
                          }
                        >
                          {suggestion.status.toUpperCase()}
                        </Badge>
                      </div>

                      <p
                        className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground"
                        title={
                          suggestion.description?.trim()
                            ? suggestion.description
                            : undefined
                        }
                      >
                        {suggestion.description || "No description provided."}
                      </p>

                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {suggestion.tags.map((tag) => (
                          <Badge
                            key={`${suggestion.id}-${tag}`}
                            variant="outline"
                            className="border-primary/20 bg-background text-[10px] text-primary"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {suggestion.image && (
                        <img
                          src={suggestion.image}
                          alt={suggestion.title}
                          className="mb-4 h-32 w-full border border-border object-cover"
                          style={{
                            filter:
                              "saturate(0.65) brightness(0.78) contrast(1.08)",
                          }}
                        />
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            void mgr.approveSuggestion(suggestion.id)
                          }}
                          disabled={!isPending || isBusy}
                          className="text-[10px] uppercase"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          {isBusy ? "PROCESSING..." : "APPROVE"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            void mgr.rejectSuggestion(suggestion.id)
                          }}
                          disabled={!isPending || isBusy}
                          className="text-[10px] uppercase"
                        >
                          <X className="mr-1 h-3 w-3" />
                          REJECT
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
