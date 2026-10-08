import { Link, useNavigate } from "@tanstack/react-router"

import { AdminLoginCard } from "@/components/admin-login-card"
import { EventFormPanel } from "@/components/event-form-panel"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEventManagerContext } from "@/event-manager-context"
import { formatDateRange } from "@/lib/calendar"
import { cn } from "@/lib/utils"
import type { EventSuggestion } from "@/types/event"
import {
  BarChart3,
  Calendar,
  Check,
  ExternalLink,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  X,
} from "lucide-react"

const STATUS_STYLES: Record<EventSuggestion["status"], string> = {
  pending: "border-primary/40 bg-primary/10 text-foreground",
  approved: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  rejected: "border-accent/40 bg-accent/10 text-foreground",
}

const STATUS_LABELS: Record<EventSuggestion["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
}

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
    <div>
      <PageHeader
        title="Admin"
        description={
          mgr.admin
            ? `Signed in as ${mgr.admin.email}. Create events and review community suggestions.`
            : undefined
        }
        actions={
          mgr.admin ? (
            <>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl px-4"
                asChild
              >
                <Link to="/admin/dashboard">
                  <BarChart3 />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl px-4"
                onClick={() => {
                  void mgr.logout()
                }}
                disabled={mgr.isAuthenticating}
              >
                <LogOut />
                {mgr.isAuthenticating ? "Signing out…" : "Sign out"}
              </Button>
            </>
          ) : undefined
        }
      />

      {!mgr.admin ? (
        <AdminLoginCard />
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <EventFormPanel
            title="Create an event"
            description="Published right away to the public feed."
            form={mgr.eventForm}
            preview={mgr.eventImagePreview}
            submitLabel="Publish event"
            submitIcon={<Plus />}
            busy={mgr.isSubmitting}
            disabled={mgr.isSubmitting}
            onFieldChange={mgr.updateEventField}
            onSubmit={() => {
              void handleAddEvent()
            }}
            allowCreateTags
          />

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
                  Review queue
                  <Badge variant="tag" className="font-sans">
                    {mgr.suggestions.length}
                  </Badge>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Approving a suggestion turns it into a published event.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-xl px-4"
                onClick={() => {
                  mgr.refreshSuggestions()
                }}
                disabled={
                  mgr.isSuggestionsLoading || mgr.isSuggestionsRefreshing
                }
              >
                <RefreshCw
                  className={cn(mgr.isSuggestionsRefreshing && "animate-spin")}
                />
                Refresh
              </Button>
            </div>

            {mgr.isSuggestionsLoading ? (
              <div className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">
                Loading suggestions…
              </div>
            ) : mgr.suggestions.length === 0 ? (
              <div className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">
                Nothing to review right now.
              </div>
            ) : (
              <div className="space-y-4">
                {mgr.suggestions.map((suggestion) => {
                  const isBusy = mgr.activeSuggestionId === suggestion.id
                  const isPending = suggestion.status === "pending"

                  return (
                    <article
                      key={suggestion.id}
                      className="rounded-xl border border-border bg-background/50 p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-serif text-lg font-semibold">
                            {suggestion.title}
                          </h3>
                          <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              {formatDateRange(
                                suggestion.date,
                                suggestion.endDate
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              {suggestion.location || "No location provided"}
                            </div>
                            {suggestion.sourceEventPage ? (
                              <div className="flex min-w-0 items-start gap-1.5">
                                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
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
                          className={STATUS_STYLES[suggestion.status]}
                        >
                          {STATUS_LABELS[suggestion.status]}
                        </Badge>
                      </div>

                      <p
                        className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground"
                        title={
                          suggestion.description?.trim()
                            ? suggestion.description
                            : undefined
                        }
                      >
                        {suggestion.description || "No description provided."}
                      </p>

                      {suggestion.tags.length > 0 ? (
                        <div className="mb-4 flex flex-wrap gap-1.5">
                          {suggestion.tags.map((tag) => (
                            <Badge
                              key={`${suggestion.id}-${tag}`}
                              variant="tag"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}

                      {suggestion.image && (
                        <img
                          src={suggestion.image}
                          alt={suggestion.title}
                          className="mb-4 h-32 w-full rounded-lg border border-border object-cover"
                        />
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => {
                            void mgr.approveSuggestion(suggestion.id)
                          }}
                          disabled={!isPending || isBusy}
                          className="rounded-lg px-3"
                        >
                          <Check />
                          {isBusy ? "Working…" : "Approve"}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            void mgr.rejectSuggestion(suggestion.id)
                          }}
                          disabled={!isPending || isBusy}
                          className="rounded-lg px-3"
                        >
                          <X />
                          Reject
                        </Button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
