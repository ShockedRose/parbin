import { Link, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

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

const STATUS_LABEL_KEYS: Record<EventSuggestion["status"], string> = {
  pending: "status.pending",
  approved: "status.approved",
  rejected: "status.rejected",
}

export function AdminPage() {
  const { t } = useTranslation()
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
        title={t("pages.admin.title")}
        description={
          mgr.admin
            ? t("pages.admin.signedInDescription", { email: mgr.admin.email })
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
                  {t("pages.admin.dashboard")}
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
                {mgr.isAuthenticating
                  ? t("pages.admin.signingOut")
                  : t("pages.admin.signOut")}
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
            title={t("pages.admin.createTitle")}
            description={t("pages.admin.createDescription")}
            form={mgr.eventForm}
            preview={mgr.eventImagePreview}
            submitLabel={t("pages.admin.publish")}
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
                  {t("pages.admin.reviewQueue")}
                  <Badge variant="tag" className="font-sans">
                    {mgr.suggestions.length}
                  </Badge>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("pages.admin.reviewDescription")}
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
                {t("common.refresh")}
              </Button>
            </div>

            {mgr.isSuggestionsLoading ? (
              <div className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">
                {t("pages.admin.loadingSuggestions")}
              </div>
            ) : mgr.suggestions.length === 0 ? (
              <div className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">
                {t("pages.admin.emptySuggestions")}
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
                              {suggestion.location ||
                                t("pages.admin.noLocation")}
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
                          {t(STATUS_LABEL_KEYS[suggestion.status])}
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
                        {suggestion.description ||
                          t("pages.admin.noDescription")}
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
                          {isBusy
                            ? t("common.working")
                            : t("pages.admin.approve")}
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
                          {t("pages.admin.reject")}
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
