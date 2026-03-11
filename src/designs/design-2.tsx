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
  Leaf,
} from "lucide-react"

const theme = {
  "--color-background": "#faf8f4",
  "--color-foreground": "#2d2418",
  "--color-card": "#f5f0e8",
  "--color-card-foreground": "#2d2418",
  "--color-popover": "#f5f0e8",
  "--color-popover-foreground": "#2d2418",
  "--color-primary": "#c4572a",
  "--color-primary-foreground": "#faf8f4",
  "--color-secondary": "#e8dfd3",
  "--color-secondary-foreground": "#2d2418",
  "--color-muted": "#ece6db",
  "--color-muted-foreground": "#8b7d6b",
  "--color-accent": "#7d8c6e",
  "--color-accent-foreground": "#faf8f4",
  "--color-destructive": "#b33a3a",
  "--color-border": "#d9cfc1",
  "--color-input": "#ece6db",
  "--color-ring": "#c4572a",
  "--radius-sm": "0.5rem",
  "--radius-md": "0.75rem",
  "--radius-lg": "1rem",
  "--radius-xl": "1.25rem",
  "--radius-2xl": "1.5rem",
  "--radius-3xl": "1.75rem",
  "--radius-4xl": "2rem",
} as React.CSSProperties

export default function Design2() {
  const mgr = useEventManager()

  return (
    <div
      style={{ ...theme, fontFamily: "'Source Sans 3', sans-serif" }}
      className="min-h-screen bg-background text-foreground"
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 30% 20%, #c4572a 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #7d8c6e 0%, transparent 50%)",
        }}
      />

      <header className="relative border-b border-border/60 px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Leaf className="h-5 w-5 text-accent" />
              <h1
                style={{ fontFamily: "'Lora', serif" }}
                className="text-2xl font-semibold tracking-tight"
              >
                TechMeetups
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Community-driven tech gatherings
            </p>
          </div>
          <nav className="flex gap-1">
            <Button
              variant={mgr.view === "events" ? "default" : "ghost"}
              size="sm"
              onClick={() => mgr.setView("events")}
              className="text-sm"
            >
              Events
            </Button>
            <Button
              variant={mgr.view === "admin" ? "default" : "ghost"}
              size="sm"
              onClick={() => mgr.setView("admin")}
              className="text-sm"
            >
              Admin
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-10">
        {mgr.view === "events" ? (
          <div>
            <div className="mb-10 text-center">
              <p className="mb-2 text-sm font-medium tracking-wide text-accent">
                Discover & Connect
              </p>
              <h2
                style={{ fontFamily: "'Lora', serif" }}
                className="text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Upcoming Events
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Find your next tech community gathering. From workshops to
                conferences, there&apos;s something for every developer.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mgr.events.map((event) => (
                <Card
                  key={event.id}
                  className="group overflow-hidden border-border/50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                      {event.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="border-0 bg-white/90 text-[11px] font-medium text-foreground backdrop-blur-sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs text-primary">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span className="font-medium">
                        {formatDate(event.date)}
                      </span>
                      <span className="text-muted-foreground">
                        {formatTime(event.date)}
                      </span>
                    </div>

                    <h3
                      style={{ fontFamily: "'Lora', serif" }}
                      className="mb-2 text-lg font-semibold leading-snug"
                    >
                      {event.title}
                    </h3>

                    <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>

                    <Separator className="mb-4" />

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        asChild
                      >
                        <a
                          href={getGoogleCalendarUrl(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-1.5 h-3 w-3" />
                          Google Cal
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => downloadICS(event)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-10 text-center">
              <p className="mb-2 text-sm font-medium tracking-wide text-accent">
                Organizer Panel
              </p>
              <h2
                style={{ fontFamily: "'Lora', serif" }}
                className="text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Create Event
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Share a new tech gathering with the community. Fill in the
                details below to publish your event.
              </p>
            </div>

            <Card className="mx-auto max-w-2xl border-border/50 shadow-sm">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Lora', serif" }}
                      className="text-sm font-semibold"
                    >
                      Event Title *
                    </Label>
                    <Input
                      value={mgr.form.title}
                      onChange={(e) =>
                        mgr.updateField("title", e.target.value)
                      }
                      placeholder="What's your event called?"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Lora', serif" }}
                      className="text-sm font-semibold"
                    >
                      Description
                    </Label>
                    <Textarea
                      rows={4}
                      value={mgr.form.description}
                      onChange={(e) =>
                        mgr.updateField("description", e.target.value)
                      }
                      placeholder="Tell people what they'll learn and experience..."
                      className="bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        style={{ fontFamily: "'Lora', serif" }}
                        className="text-sm font-semibold"
                      >
                        Start Date *
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
                        style={{ fontFamily: "'Lora', serif" }}
                        className="text-sm font-semibold"
                      >
                        End Date *
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
                      style={{ fontFamily: "'Lora', serif" }}
                      className="text-sm font-semibold"
                    >
                      Location
                    </Label>
                    <Input
                      value={mgr.form.location}
                      onChange={(e) =>
                        mgr.updateField("location", e.target.value)
                      }
                      placeholder="Venue name, City"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Lora', serif" }}
                      className="text-sm font-semibold"
                    >
                      Tags
                    </Label>
                    <Input
                      value={mgr.form.tags}
                      onChange={(e) =>
                        mgr.updateField("tags", e.target.value)
                      }
                      placeholder="React, Frontend, Workshop (comma separated)"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Lora', serif" }}
                      className="text-sm font-semibold"
                    >
                      Cover Image
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={mgr.handleImageChange}
                      className="bg-background file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
                    />
                    {mgr.imagePreview && (
                      <img
                        src={mgr.imagePreview}
                        alt="Preview"
                        className="mt-3 h-44 w-full rounded-xl object-cover"
                      />
                    )}
                  </div>

                  <Separator />

                  <Button
                    onClick={mgr.addEvent}
                    className="w-full"
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

      <footer className="border-t border-border/60 px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="h-4 w-4 text-accent" />
            Design 02 · Organic
          </div>
          <p className="text-xs italic text-muted-foreground">
            Warm · Earthy · Inviting
          </p>
        </div>
      </footer>
    </div>
  )
}
