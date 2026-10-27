import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { StatePanel } from "@/components/state-panel"
import { TagInput } from "@/components/tag-input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEventManagerContext } from "@/event-manager-context"
import { getEvent } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { AnalyticsEvent, trackEvent } from "@/lib/analytics"
import {
  downloadICS,
  formatDateRange,
  getGoogleCalendarUrl,
  trackGoogleCalendarOpen,
} from "@/lib/calendar"
import { getEventImageTransitionName } from "@/lib/view-transitions"
import type { EventFormFields, MeetupEvent } from "@/types/event"
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  Download,
  ExternalLink,
  MapPin,
  Pencil,
  Save,
  X,
} from "lucide-react"

function eventToEditForm(event: MeetupEvent): EventFormFields {
  return {
    title: event.title,
    description: event.description,
    date: event.date,
    endDate: event.endDate,
    location: event.location,
    sourceEventPage: event.sourceEventPage ?? "",
    image: event.image,
    tags: [...event.tags],
  }
}

const eventDetailsRouteApi = getRouteApi("/events/$eventId")

function BackLink() {
  const { t } = useTranslation()

  return (
    <Button
      asChild
      variant="ghost"
      className="-ml-2 rounded-lg px-2 text-muted-foreground"
    >
      <Link to="/">
        <ArrowLeft />
        {t("pages.eventDetails.allEvents")}
      </Link>
    </Button>
  )
}

export function EventDetailsPage() {
  const { t } = useTranslation()
  const { eventId } = eventDetailsRouteApi.useParams()
  const mgr = useEventManagerContext()
  const fromFeed = mgr.events.find((item) => item.id === eventId)
  const needsRemoteEvent =
    !fromFeed && !mgr.isBootstrapping && !mgr.isEventsLoading

  const eventDetailQuery = useQuery({
    queryKey: queryKeys.event(eventId),
    queryFn: () => getEvent(eventId),
    enabled: needsRemoteEvent,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<EventFormFields>({
    title: "",
    description: "",
    date: "",
    endDate: "",
    location: "",
    sourceEventPage: "",
    image: "",
    tags: [],
  })

  const event = fromFeed ?? eventDetailQuery.data ?? null
  const viewedEventId = event?.id
  const viewedEventTitle = event?.title

  useEffect(() => {
    if (!viewedEventId || !viewedEventTitle) return
    trackEvent(AnalyticsEvent.EventViewed, {
      event_id: viewedEventId,
      title: viewedEventTitle,
    })
  }, [viewedEventId, viewedEventTitle])

  const isAdmin = !!mgr.admin

  const startEditing = () => {
    if (!event) return
    setEditForm(eventToEditForm(event))
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const updateField = <K extends keyof EventFormFields>(
    field: K,
    value: EventFormFields[K]
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const saveChanges = async () => {
    if (!event) return

    const success = await mgr.editEvent(event.id, {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      date: editForm.date,
      endDate: editForm.endDate,
      location: editForm.location.trim(),
      image: editForm.image.trim(),
      tags: editForm.tags,
      sourceEventPage: editForm.sourceEventPage.trim(),
    })

    if (success) {
      setIsEditing(false)
    }
  }

  const canSave =
    editForm.title.trim() !== "" &&
    editForm.date !== "" &&
    editForm.endDate !== ""

  if (
    mgr.isBootstrapping ||
    mgr.isEventsLoading ||
    (needsRemoteEvent && eventDetailQuery.isLoading)
  ) {
    return (
      <StatePanel className="mx-auto max-w-4xl">
        {t("pages.eventDetails.loading")}
      </StatePanel>
    )
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8">
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">
          {t("pages.eventDetails.notAvailableTitle")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {t("pages.eventDetails.notAvailableDescription")}
        </p>
        <Button asChild size="lg" className="mt-6 rounded-xl px-4">
          <Link to="/">
            <ArrowLeft />
            {t("pages.eventDetails.backToAll")}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0">
      <div className="mb-4">
        <BackLink />
      </div>

      <article className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-64 overflow-hidden bg-muted sm:h-96">
          <img
            src={
              isEditing && editForm.image.trim()
                ? editForm.image.trim()
                : event.image
            }
            alt={event.title}
            className="h-full w-full object-cover"
            style={{
              filter: "brightness(0.9)",
              viewTransitionName: getEventImageTransitionName(event.id),
            }}
          />
        </div>

        <div className="min-w-0 space-y-6 p-6 sm:p-8">
          <header className="space-y-3">
            {event.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="tag">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            {isEditing ? (
              <div className="space-y-2">
                <Label>{t("pages.eventDetails.titleLabel")}</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="h-12 font-serif text-lg"
                  placeholder={t("pages.eventDetails.titlePlaceholder")}
                />
              </div>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h1 className="max-w-3xl font-serif text-3xl leading-tight font-semibold break-words sm:text-4xl">
                  {event.title}
                </h1>
                {isAdmin ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={startEditing}
                    className="rounded-xl px-4"
                  >
                    <Pencil />
                    {t("pages.eventDetails.edit")}
                  </Button>
                ) : null}
              </div>
            )}
          </header>

          {isEditing ? (
            <div className="space-y-5 rounded-xl border border-border bg-background/50 p-5">
              <div className="space-y-2">
                <Label>{t("pages.eventDetails.descriptionLabel")}</Label>
                <Textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder={t("pages.eventDetails.descriptionPlaceholder")}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("pages.eventDetails.starts")}</Label>
                  <Input
                    type="datetime-local"
                    value={editForm.date}
                    onChange={(e) => updateField("date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("pages.eventDetails.ends")}</Label>
                  <Input
                    type="datetime-local"
                    value={editForm.endDate}
                    onChange={(e) => updateField("endDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("pages.eventDetails.location")}</Label>
                <Input
                  value={editForm.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder={t("pages.eventDetails.locationPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("pages.eventDetails.eventPage")}</Label>
                <Input
                  type="url"
                  inputMode="url"
                  value={editForm.sourceEventPage}
                  onChange={(e) =>
                    updateField("sourceEventPage", e.target.value)
                  }
                  placeholder={t("pages.eventDetails.eventPagePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("pages.eventDetails.tags")}</Label>
                <TagInput
                  value={editForm.tags}
                  onChange={(tags) => updateField("tags", tags)}
                  allowCreate
                  disabled={mgr.isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("pages.eventDetails.imageUrl")}</Label>
                <Input
                  value={editForm.image}
                  onChange={(e) => updateField("image", e.target.value)}
                  placeholder="https://…"
                />
              </div>

              <div className="flex min-w-0 flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  onClick={saveChanges}
                  disabled={!canSave || mgr.isSubmitting}
                  className="h-11 flex-1 rounded-xl text-[15px]"
                >
                  <Save />
                  {mgr.isSubmitting
                    ? t("pages.eventDetails.saving")
                    : t("pages.eventDetails.saveChanges")}
                </Button>
                <Button
                  onClick={cancelEditing}
                  variant="outline"
                  disabled={mgr.isSubmitting}
                  className="h-11 rounded-xl px-5 text-[15px]"
                >
                  <X />
                  {t("pages.eventDetails.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex min-w-0 flex-wrap gap-2 text-sm">
                <div className="flex max-w-full min-w-0 items-start gap-2 rounded-xl bg-muted px-3 py-2">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 break-words">
                    {formatDateRange(event.date, event.endDate)}
                  </span>
                </div>
                <div className="flex max-w-full min-w-0 items-start gap-2 rounded-xl bg-muted px-3 py-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="min-w-0 break-words">{event.location}</span>
                </div>
                {event.sourceEventPage ? (
                  <a
                    href={event.sourceEventPage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex max-w-full min-w-0 items-start gap-2 rounded-xl bg-muted px-3 py-2 transition-colors hover:bg-primary/15"
                  >
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0 break-all">
                      {t("pages.eventDetails.originalListing")}
                    </span>
                  </a>
                ) : null}
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                  href={getGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackGoogleCalendarOpen(event)}
                  className="flex min-w-0 items-start gap-3 rounded-xl bg-primary px-5 py-4 text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
                >
                  <CalendarPlus className="mt-0.5 h-5 w-5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block font-semibold">
                      {t("pages.eventDetails.addToGoogle")}
                    </span>
                    <span className="mt-0.5 block text-sm text-primary-foreground/75">
                      {t("pages.eventDetails.addToGoogleHint")}
                    </span>
                  </span>
                </a>

                <button
                  type="button"
                  onClick={() => downloadICS(event)}
                  className="flex min-w-0 items-start gap-3 rounded-xl border border-border px-5 py-4 text-left transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
                >
                  <Download className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block font-semibold">
                      {t("pages.eventDetails.downloadIcs")}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {t("pages.eventDetails.downloadIcsHint")}
                    </span>
                  </span>
                </button>
              </div>

              <section className="space-y-3 border-t border-border pt-6">
                <h2 className="font-serif text-xl font-semibold">
                  {t("pages.eventDetails.about")}
                </h2>
                <p className="leading-7 whitespace-pre-wrap text-foreground/85">
                  {event.description}
                </p>
              </section>
            </>
          )}
        </div>
      </article>
    </div>
  )
}
