import { useState } from "react"
import { Link } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useEventManagerContext } from "@/event-manager-context"
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
  image: string
}

function eventToEditForm(event: MeetupEvent): EditFormState {
  return {
    title: event.title,
    description: event.description,
    date: event.date,
    endDate: event.endDate,
    image: event.image,
  }
}

export function EventDetailsPage({ eventId }: { eventId: string }) {
  const mgr = useEventManagerContext()
  const event = mgr.events.find((item) => item.id === eventId)

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    description: "",
    date: "",
    endDate: "",
    image: "",
  })

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
      location: event.location,
      image: editForm.image.trim(),
      tags: event.tags,
    })

    if (success) {
      setIsEditing(false)
    }
  }

  const canSave =
    editForm.title.trim() !== "" &&
    editForm.date !== "" &&
    editForm.endDate !== ""

  if (mgr.isBootstrapping || mgr.isEventsLoading) {
    return (
      <div className="border border-border bg-card px-6 py-12 text-center text-xs tracking-[0.3em] text-primary">
        LOADING_EVENT_PAYLOAD...
      </div>
    )
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl border border-border bg-card p-8">
        <div className="mb-3 text-[10px] tracking-[0.3em] text-muted-foreground">
          ▸ EVENT_NODE // NOT_FOUND
        </div>
        <h2 className="font-display text-2xl font-bold tracking-wider text-foreground sm:text-4xl">
          EVENT NOT AVAILABLE
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          This event could not be found in the current feed. It may have been
          removed or the link is no longer valid.
        </p>
        <Button
          asChild
          className="mt-6 text-[11px] tracking-[0.24em] uppercase"
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
    <article className="mx-auto max-w-4xl overflow-hidden border border-border bg-card">
      <div className="relative h-72 overflow-hidden border-b border-border sm:h-96">
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
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-6 sm:p-8">
          <div className="mb-3 flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-primary/40 bg-background/70 text-[10px] tracking-[0.18em] text-primary uppercase backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
          {isEditing ? (
            <Input
              value={editForm.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="max-w-3xl border-primary/30 bg-background/80 font-display text-2xl font-bold tracking-wide text-foreground backdrop-blur-sm sm:text-4xl"
              placeholder=">> Event title"
            />
          ) : (
            <h1 className="max-w-3xl font-display text-3xl font-bold tracking-wide text-foreground sm:text-5xl">
              {event.title}
            </h1>
          )}
        </div>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        {isAdmin && !isEditing && (
          <Button
            variant="outline"
            onClick={startEditing}
            className="text-[11px] tracking-[0.22em] uppercase"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Event
          </Button>
        )}

        {isEditing && (
          <div className="space-y-5 border border-primary/20 bg-background/60 p-5">
            <div className="border-b border-border pb-2 text-[10px] tracking-[0.3em] text-primary">
              ▸ ADMIN // EDIT_MODE
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] tracking-wider text-primary uppercase">
                event.description
              </Label>
              <Textarea
                rows={4}
                value={editForm.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder=">> Describe the event..."
                className="border-border bg-background font-mono"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[11px] tracking-wider text-primary uppercase">
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
                <Label className="text-[11px] tracking-wider text-primary uppercase">
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
              <Label className="text-[11px] tracking-wider text-primary uppercase">
                event.image_url
              </Label>
              <Input
                value={editForm.image}
                onChange={(e) => updateField("image", e.target.value)}
                placeholder=">> https://..."
                className="border-border bg-background font-mono"
              />
            </div>

            <Separator className="border-border" />

            <div className="flex gap-3">
              <Button
                onClick={saveChanges}
                disabled={!canSave || mgr.isSubmitting}
                className="flex-1 text-[11px] tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(53,128,255,0.2)]"
                size="lg"
              >
                <Save className="h-4 w-4" />
                {mgr.isSubmitting ? "SAVING..." : "Save Changes"}
              </Button>
              <Button
                onClick={cancelEditing}
                variant="outline"
                disabled={mgr.isSubmitting}
                className="text-[11px] tracking-[0.22em] uppercase"
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
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 border border-border bg-background/60 px-3 py-2">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {formatDateRange(event.date, event.endDate)}
              </div>
              <div className="flex items-center gap-2 border border-border bg-background/60 px-3 py-2">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                {event.location}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Button
                asChild
                size="lg"
                className="h-auto min-h-16 justify-start px-5 py-4 text-left shadow-[0_0_18px_rgba(53,128,255,0.15)]"
              >
                <a
                  href={getGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="flex flex-col items-start">
                    <span className="text-[11px] tracking-[0.22em] uppercase">
                      Add To Google Calendar
                    </span>
                    <span className="text-[10px] tracking-[0.14em] text-primary-foreground/75 uppercase">
                      Open the event with date, time, and location prefilled
                    </span>
                  </span>
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-auto min-h-16 justify-start px-5 py-4 text-left"
                onClick={() => downloadICS(event)}
              >
                <Download className="h-4 w-4" />
                <span className="flex flex-col items-start">
                  <span className="text-[11px] tracking-[0.22em] uppercase">
                    Download ICS File
                  </span>
                  <span className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                    Save a calendar file for Apple Calendar, Outlook, or any ICS
                    app
                  </span>
                </span>
              </Button>
            </div>

            <section className="space-y-3">
              <div className="text-[10px] tracking-[0.3em] text-muted-foreground">
                ▸ EVENT_BRIEFING // DESCRIPTION
              </div>
              <p className="text-sm leading-7 whitespace-pre-wrap text-foreground/88 sm:text-base">
                {event.description}
              </p>
            </section>

            <Button
              asChild
              variant="ghost"
              className="px-0 text-[11px] tracking-[0.24em] uppercase"
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
