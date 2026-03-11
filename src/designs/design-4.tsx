import { Link } from "react-router-dom"
import { useEventManager } from "@/hooks/use-event-manager"
import {
  getGoogleCalendarUrl,
  downloadICS,
  formatDate,
  formatTime,
} from "@/lib/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  CalendarDays,
  MapPin,
  ArrowLeft,
  Plus,
  Download,
  ExternalLink,
  Clock,
} from "lucide-react"

const theme = {
  "--color-background": "#f9f7f3",
  "--color-foreground": "#1a1a2e",
  "--color-card": "#ffffff",
  "--color-card-foreground": "#1a1a2e",
  "--color-popover": "#ffffff",
  "--color-popover-foreground": "#1a1a2e",
  "--color-primary": "#1a1a2e",
  "--color-primary-foreground": "#f9f7f3",
  "--color-secondary": "#f0ede6",
  "--color-secondary-foreground": "#1a1a2e",
  "--color-muted": "#f0ede6",
  "--color-muted-foreground": "#6b6b80",
  "--color-accent": "#c9a84c",
  "--color-accent-foreground": "#1a1a2e",
  "--color-destructive": "#c93c3c",
  "--color-border": "#e0ddd5",
  "--color-input": "#f5f3ee",
  "--color-ring": "#c9a84c",
  "--radius-sm": "0.15rem",
  "--radius-md": "0.2rem",
  "--radius-lg": "0.25rem",
  "--radius-xl": "0.35rem",
  "--radius-2xl": "0.45rem",
  "--radius-3xl": "0.55rem",
  "--radius-4xl": "0.65rem",
} as React.CSSProperties

export default function Design4() {
  const mgr = useEventManager()
  const featured = mgr.events[0]
  const rest = mgr.events.slice(1)

  return (
    <div
      style={{ ...theme, fontFamily: "'Inter Tight', sans-serif" }}
      className="min-h-screen bg-background text-foreground"
    >
      <header className="border-b border-border px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between py-4">
          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" />
            Back
          </Link>
          <nav className="flex gap-1">
            <Button
              variant={mgr.view === "events" ? "default" : "ghost"}
              size="sm"
              onClick={() => mgr.setView("events")}
              className="text-xs font-medium"
            >
              Events
            </Button>
            <Button
              variant={mgr.view === "admin" ? "default" : "ghost"}
              size="sm"
              onClick={() => mgr.setView("admin")}
              className="text-xs font-medium"
            >
              Admin
            </Button>
          </nav>
        </div>
        <div className="mx-auto max-w-6xl border-t border-border py-6 text-center">
          <p
            className="mb-1 text-xs font-medium uppercase tracking-[0.4em]"
            style={{ color: "#c9a84c" }}
          >
            The
          </p>
          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Tech Meetups
          </h1>
          <p
            className="mt-1 text-xs font-medium uppercase tracking-[0.4em]"
            style={{ color: "#c9a84c" }}
          >
            Journal
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {mgr.view === "events" ? (
          <div>
            {featured && (
              <div className="mb-12">
                <p
                  className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em]"
                  style={{ color: "#c9a84c" }}
                >
                  Featured
                </p>
                <Card className="overflow-hidden border-border shadow-sm">
                  <div className="grid md:grid-cols-2">
                    <div className="relative h-64 overflow-hidden md:h-auto">
                      <img
                        src={featured.image}
                        alt={featured.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="flex flex-col justify-center p-8 md:p-10">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {featured.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-[10px] font-semibold uppercase tracking-wider"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h2
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="mb-3 text-2xl font-bold leading-tight sm:text-3xl"
                      >
                        {featured.title}
                      </h2>
                      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(featured.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(featured.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {featured.location}
                        </span>
                      </div>
                      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                        {featured.description}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" className="text-xs" asChild>
                          <a
                            href={getGoogleCalendarUrl(featured)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-1.5 h-3 w-3" />
                            Add to Google Calendar
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => downloadICS(featured)}
                        >
                          <Download className="mr-1.5 h-3 w-3" />
                          .ics
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            )}

            <Separator className="mb-8" />

            <div className="mb-6 flex items-center justify-between">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.3em]"
                style={{ color: "#c9a84c" }}
              >
                All Events
              </p>
              <p className="text-xs text-muted-foreground">
                {mgr.events.length} gatherings
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((event) => (
                <article key={event.id} className="group">
                  <div className="mb-3 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: "#c9a84c" }}
                      >
                        {tag}
                        {tag !== event.tags[event.tags.length - 1] && (
                          <span className="ml-1.5 text-border">·</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <h3
                    style={{ fontFamily: "'Playfair Display', serif" }}
                    className="mb-2 text-lg font-bold leading-snug"
                  >
                    {event.title}
                  </h3>
                  <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatDate(event.date)}</span>
                    <span>·</span>
                    <span>{event.location}</span>
                  </div>
                  <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px]"
                      asChild
                    >
                      <a
                        href={getGoogleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Calendar
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px]"
                      onClick={() => downloadICS(event)}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      .ics
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-10 text-center">
              <p
                className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em]"
                style={{ color: "#c9a84c" }}
              >
                Administration
              </p>
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Publish a New Event
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Craft the details for your next gathering. Every field shapes how
                your event appears in the journal.
              </p>
            </div>

            <Card className="mx-auto max-w-2xl border-border shadow-sm">
              <CardContent className="p-8 md:p-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Playfair Display', serif" }}
                      className="text-sm font-semibold"
                    >
                      Title *
                    </Label>
                    <Input
                      value={mgr.form.title}
                      onChange={(e) =>
                        mgr.updateField("title", e.target.value)
                      }
                      placeholder="Name of the event"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Playfair Display', serif" }}
                      className="text-sm font-semibold"
                    >
                      Description
                    </Label>
                    <Textarea
                      rows={5}
                      value={mgr.form.description}
                      onChange={(e) =>
                        mgr.updateField("description", e.target.value)
                      }
                      placeholder="Paint the picture — what will attendees experience?"
                      className="bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-sm font-semibold"
                      >
                        Opens *
                      </Label>
                      <Input
                        type="datetime-local"
                        value={mgr.form.date}
                        onChange={(e) =>
                          mgr.updateField("date", e.target.value)
                        }
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-sm font-semibold"
                      >
                        Closes *
                      </Label>
                      <Input
                        type="datetime-local"
                        value={mgr.form.endDate}
                        onChange={(e) =>
                          mgr.updateField("endDate", e.target.value)
                        }
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Playfair Display', serif" }}
                      className="text-sm font-semibold"
                    >
                      Venue
                    </Label>
                    <Input
                      value={mgr.form.location}
                      onChange={(e) =>
                        mgr.updateField("location", e.target.value)
                      }
                      placeholder="Location name, City"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Playfair Display', serif" }}
                      className="text-sm font-semibold"
                    >
                      Categories
                    </Label>
                    <Input
                      value={mgr.form.tags}
                      onChange={(e) =>
                        mgr.updateField("tags", e.target.value)
                      }
                      placeholder="React, Frontend, Workshop"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Playfair Display', serif" }}
                      className="text-sm font-semibold"
                    >
                      Cover Photograph
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={mgr.handleImageChange}
                      className="bg-background file:mr-4 file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
                    />
                    {mgr.imagePreview && (
                      <img
                        src={mgr.imagePreview}
                        alt="Preview"
                        className="mt-3 aspect-[16/10] w-full object-cover"
                      />
                    )}
                  </div>

                  <Separator />

                  <Button
                    onClick={mgr.addEvent}
                    className="w-full text-xs font-semibold uppercase tracking-wider"
                    size="lg"
                    disabled={
                      !mgr.form.title ||
                      !mgr.form.date ||
                      !mgr.form.endDate
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Publish Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="border-t border-border px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Design 04 · Editorial
          </p>
          <p
            className="text-[11px] font-medium italic"
            style={{ color: "#c9a84c" }}
          >
            Clean · Sophisticated · Refined
          </p>
        </div>
      </footer>
    </div>
  )
}
