import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useEventManagerContext } from "@/event-manager-context"
import { getEvent } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import {
  downloadICS,
  formatDateRange,
  getGoogleCalendarUrl,
} from "@/lib/calendar"
import { getEventImageTransitionName } from "@/lib/view-transitions"
import type { MeetupEvent } from "@/types/event"
import {
  ArrowLeft,
  Calendar,
  Download,
  ExternalLink,
  MapPin,
  Pencil,
  Save,
  X,
} from "lucide-react"

interface EditFormState {
  title: string
  description: string
  date: string
  endDate: string
  location: string
  sourceEventPage: string
  image: string
  tags: string
}

function eventToEditForm(event: MeetupEvent): EditFormState {
  return {
    title: event.title,
    description: event.description,
    date: event.date,
    endDate: event.endDate,
    location: event.location,
    sourceEventPage: event.sourceEventPage ?? "",
    image: event.image,
    tags: event.tags.join(", "),
  }
}

const eventDetailsRouteApi = getRouteApi("/events/$eventId")

export function EventDetailsPage() {
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
  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    description: "",
    date: "",
    endDate: "",
    location: "",
    sourceEventPage: "",
    image: "",
    tags: "",
  })

  const event = fromFeed ?? eventDetailQuery.data ?? null

  const isAdmin = !!mgr.admin

  const startEditing = () => {
    if (!event) return
    setEditForm(eventToEditForm(event))
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const updateField = (field: keyof EditFormState, value: string) => {
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
      tags: editForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
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
      <div className="rounded-xl border border-border bg-card px-6 py-12 text-center text-xs text-primary">
        LOADING_EVENT_PAYLOAD...
      </div>
    )
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-8">
        <div className="mb-3 text-[10px] text-muted-foreground">
          ▸ EVENT_NODE // NOT_FOUND
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground sm:text-4xl">
          EVENT NOT AVAILABLE
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          This event could not be found in the current feed. It may have been
          removed or the link is no longer valid.
        </p>
        <Button
          asChild
          className="mt-6 text-[11px] uppercase"
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back To Event Stream
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <article className="mx-auto w-full min-w-0 max-w-4xl overflow-hidden rounded-xl border border-border bg-card">
      <div className="h-72 overflow-hidden border-b border-border sm:h-96">
        <img
          src={
            isEditing && editForm.image.trim()
              ? editForm.image.trim()
              : event.image
          }
          alt={event.title}
          className="h-full w-full object-cover"
          style={{
            filter: "saturate(1.05) brightness(0.72) contrast(1.18)",
            viewTransitionName: getEventImageTransitionName(event.id),
          }}
        />
      </div>

      <div className="min-w-0 border-b border-border px-6 py-5 sm:px-8 sm:py-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <Badge
              key={tag}
              variant="node"
              className="text-[10px] font-medium tracking-wide uppercase"
            >
              {tag}
            </Badge>
          ))}
        </div>
        {isEditing ? (
          <Input
            value={editForm.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="max-w-3xl border-border font-display text-[1.1875rem] font-bold text-foreground sm:text-lg"
            placeholder=">> Event title"
          />
        ) : (
          <h2 className="max-w-full break-words font-display text-[1.625rem] font-bold leading-tight text-foreground sm:max-w-3xl sm:text-2xl sm:leading-snug">
            {event.title}
          </h2>
        )}
      </div>

      <div className="min-w-0 space-y-8 p-6 sm:p-8">
        {isAdmin && !isEditing && (
          <Button
            variant="outline"
            onClick={startEditing}
            className="text-[11px] uppercase"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Event
          </Button>
        )}

        {isEditing && (
          <div className="space-y-5 border border-primary/20 bg-background/60 p-5">
            <div className="border-b border-border pb-2 text-[10px] text-primary">
              ▸ ADMIN // EDIT_MODE
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] text-primary uppercase">
                event.description
              </Label>
              <Textarea
                rows={4}
                value={editForm.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder=">> Describe the event..."
                className="border-border bg-background"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[11px] text-primary uppercase">
                  date.start *
                </Label>
                <Input
                  type="datetime-local"
                  value={editForm.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] text-primary uppercase">
                  date.end *
                </Label>
                <Input
                  type="datetime-local"
                  value={editForm.endDate}
                  onChange={(e) => updateField("endDate", e.target.value)}
                  className="border-border bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] text-primary uppercase">
                event.location
              </Label>
              <Input
                value={editForm.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder=">> Venue, City, State"
                className="border-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] text-primary uppercase">
                event.source_event_page
              </Label>
              <Input
                type="url"
                inputMode="url"
                value={editForm.sourceEventPage}
                onChange={(e) => updateField("sourceEventPage", e.target.value)}
                placeholder=">> https://… (optional)"
                className="border-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] text-primary uppercase">
                event.tags[]
              </Label>
              <Input
                value={editForm.tags}
                onChange={(e) => updateField("tags", e.target.value)}
                placeholder=">> AI, Workshop, Community"
                className="border-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] text-primary uppercase">
                event.image_url
              </Label>
              <Input
                value={editForm.image}
                onChange={(e) => updateField("image", e.target.value)}
                placeholder=">> https://..."
                className="border-border bg-background"
              />
            </div>

            <Separator className="border-border" />

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
              <Button
                onClick={saveChanges}
                disabled={!canSave || mgr.isSubmitting}
                className="w-full py-3 sm:py-0 flex-1 text-[11px] uppercase parbin-glow-primary-sm sm:w-auto"
                size="lg"
              >
                <Save className="h-4 w-4" />
                {mgr.isSubmitting ? "SAVING..." : "Save Changes"}
              </Button>
              <Button
                onClick={cancelEditing}
                variant="outline"
                disabled={mgr.isSubmitting}
                className="w-full shrink-0 text-[11px] uppercase sm:w-auto"
                size="lg"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!isEditing && (
          <>
            <div className="flex min-w-0 flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex min-w-0 max-w-full items-start gap-2 border border-border bg-background px-3 py-2">
                <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="min-w-0 break-words">
                  {formatDateRange(event.date, event.endDate)}
                </span>
              </div>
              <div className="flex min-w-0 max-w-full items-start gap-2 border border-border bg-background/60 px-3 py-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="min-w-0 break-words">{event.location}</span>
              </div>
              {event.sourceEventPage ? (
                <div className="flex min-w-0 max-w-full items-start gap-2 border border-border bg-background px-3 py-2">
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <a
                    href={event.sourceEventPage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 break-all text-sm text-primary underline-offset-2 hover:underline"
                  >
                    {event.sourceEventPage}
                  </a>
                </div>
              ) : null}
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
              <Button
                asChild
                size="lg"
                className="h-auto w-full min-w-0 max-w-full shrink !whitespace-normal flex-col items-start justify-start gap-2 px-4 py-3.5 text-left parbin-glow-primary-sm sm:flex-row sm:gap-3 sm:px-5 sm:py-4 lg:min-h-16"
              >
                <a
                  href={getGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full min-w-0 flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3"
                >
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] uppercase">
                      Add To Google Calendar
                    </span>
                    <span className="mt-0.5 block break-words text-[10px] leading-snug text-primary-foreground/75 sm:uppercase">
                      Open the event with date, time, and location prefilled
                    </span>
                  </span>
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-auto w-full min-w-0 max-w-full shrink !whitespace-normal flex-col items-start justify-start gap-2 px-4 py-3.5 text-left sm:flex-row sm:gap-3 sm:px-5 sm:py-4 lg:min-h-16"
                onClick={() => downloadICS(event)}
              >
                <Download className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[11px] uppercase">
                    Download ICS File
                  </span>
                  <span className="mt-0.5 block break-words text-[10px] leading-snug text-muted-foreground sm:uppercase">
                    Save a calendar file for Apple Calendar, Outlook, or any ICS
                    app
                  </span>
                </span>
              </Button>
            </div>

            <section className="space-y-3">
              <div className="text-[10px] text-muted-foreground">
                ▸ EVENT_BRIEFING // DESCRIPTION
              </div>
              <p className="text-sm leading-7 whitespace-pre-wrap text-foreground/88 sm:text-base">
                {event.description}
              </p>
            </section>

            <Button
              asChild
              variant="ghost"
              className="px-0 text-[11px] uppercase"
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Back To Event Stream
              </Link>
            </Button>
          </>
        )}
      </div>
    </article>
  )
}
