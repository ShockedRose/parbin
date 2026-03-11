import { Link } from "react-router-dom"
import { useEventManager } from "@/hooks/use-event-manager"
import {
  getGoogleCalendarUrl,
  downloadICS,
  formatDateRange,
} from "@/lib/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Plus,
  Download,
  ExternalLink,
} from "lucide-react"

const theme = {
  "--color-background": "#0a0a0a",
  "--color-foreground": "#e8e8e8",
  "--color-card": "#111111",
  "--color-card-foreground": "#e8e8e8",
  "--color-popover": "#111111",
  "--color-popover-foreground": "#e8e8e8",
  "--color-primary": "#b5ff00",
  "--color-primary-foreground": "#0a0a0a",
  "--color-secondary": "#1a1a1a",
  "--color-secondary-foreground": "#b5ff00",
  "--color-muted": "#1a1a1a",
  "--color-muted-foreground": "#666666",
  "--color-accent": "#b5ff00",
  "--color-accent-foreground": "#0a0a0a",
  "--color-destructive": "#ff3333",
  "--color-border": "#333333",
  "--color-input": "#1a1a1a",
  "--color-ring": "#b5ff00",
  "--radius-sm": "0px",
  "--radius-md": "0px",
  "--radius-lg": "0px",
  "--radius-xl": "0px",
  "--radius-2xl": "0px",
  "--radius-3xl": "0px",
  "--radius-4xl": "0px",
} as React.CSSProperties

export default function Design1() {
  const mgr = useEventManager()

  return (
    <div
      style={{ ...theme, fontFamily: "'Space Mono', monospace" }}
      className="min-h-screen bg-background text-foreground"
    >
      <header className="border-b-2 border-primary px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            to="/"
            className="text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="mr-1 inline h-3 w-3" /> BACK
          </Link>
          <h1
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            className="text-3xl tracking-[0.2em] text-primary sm:text-4xl"
          >
            TECH//MEETUPS
          </h1>
          <nav className="flex gap-4">
            <button
              onClick={() => mgr.setView("events")}
              className={`text-xs uppercase tracking-widest transition-colors ${mgr.view === "events" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              [EVENTS]
            </button>
            <button
              onClick={() => mgr.setView("admin")}
              className={`text-xs uppercase tracking-widest transition-colors ${mgr.view === "admin" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              [ADMIN]
            </button>
          </nav>
        </div>
      </header>

      <div className="overflow-hidden border-b border-border bg-primary text-primary-foreground">
        <div className="flex whitespace-nowrap py-1.5">
          <div className="animate-[marquee_40s_linear_infinite] text-xs font-bold uppercase tracking-wider">
            {mgr.events
              .map((e) => `  ◆ ${e.title} — ${e.location}  `)
              .join("")}
            {mgr.events
              .map((e) => `  ◆ ${e.title} — ${e.location}  `)
              .join("")}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {mgr.view === "events" ? (
          <div>
            <div className="mb-10 flex items-end justify-between border-b border-border pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  UPCOMING_
                </p>
                <h2
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  className="text-6xl leading-none text-foreground sm:text-8xl"
                >
                  EVENTS<span className="text-primary">.</span>
                </h2>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {mgr.events.length}_LISTED
              </p>
            </div>

            <div className="space-y-4">
              {mgr.events.map((event, i) => (
                <Card
                  key={event.id}
                  className="group overflow-hidden border-2 border-border transition-colors hover:border-primary"
                >
                  <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                    <div className="relative h-52 overflow-hidden md:h-auto">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                      />
                      <div className="absolute left-0 top-0 bg-primary px-3 py-1">
                        <span
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                          className="text-2xl leading-none text-primary-foreground"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-6">
                      <div>
                        <div className="mb-3 flex flex-wrap gap-2">
                          {event.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="border-muted-foreground/30 text-[10px] uppercase tracking-[0.2em]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                          className="text-3xl leading-none tracking-wide sm:text-4xl"
                        >
                          {event.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-primary" />
                            {formatDateRange(event.date, event.endDate)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-primary" />
                            {event.location}
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {event.description}
                        </p>
                      </div>

                      <div className="mt-5 flex gap-2">
                        <Button size="sm" className="text-[11px] uppercase tracking-widest" asChild>
                          <a
                            href={getGoogleCalendarUrl(event)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-1.5 h-3 w-3" />
                            GOOGLE_CAL
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[11px] uppercase tracking-widest"
                          onClick={() => downloadICS(event)}
                        >
                          <Download className="mr-1.5 h-3 w-3" />
                          .ICS
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-10 border-b border-border pb-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                CONTROL_PANEL
              </p>
              <h2
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                className="text-6xl leading-none text-foreground sm:text-8xl"
              >
                ADMIN<span className="text-primary">.</span>
              </h2>
            </div>

            <div className="mx-auto max-w-2xl border-2 border-border p-8">
              <div className="mb-6 border-b border-border pb-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  NEW_EVENT_FORM
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">
                    EVENT_TITLE *
                  </Label>
                  <Input
                    value={mgr.form.title}
                    onChange={(e) => mgr.updateField("title", e.target.value)}
                    placeholder="Enter event title..."
                    className="border-2 bg-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">
                    DESCRIPTION
                  </Label>
                  <Textarea
                    rows={4}
                    value={mgr.form.description}
                    onChange={(e) =>
                      mgr.updateField("description", e.target.value)
                    }
                    placeholder="Event description..."
                    className="border-2 bg-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em]">
                      START_DATE *
                    </Label>
                    <Input
                      type="datetime-local"
                      value={mgr.form.date}
                      onChange={(e) => mgr.updateField("date", e.target.value)}
                      className="border-2 bg-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em]">
                      END_DATE *
                    </Label>
                    <Input
                      type="datetime-local"
                      value={mgr.form.endDate}
                      onChange={(e) =>
                        mgr.updateField("endDate", e.target.value)
                      }
                      className="border-2 bg-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">
                    LOCATION
                  </Label>
                  <Input
                    value={mgr.form.location}
                    onChange={(e) =>
                      mgr.updateField("location", e.target.value)
                    }
                    placeholder="Venue, City, State"
                    className="border-2 bg-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">
                    TAGS (COMMA_SEPARATED)
                  </Label>
                  <Input
                    value={mgr.form.tags}
                    onChange={(e) => mgr.updateField("tags", e.target.value)}
                    placeholder="React, Frontend, Workshop"
                    className="border-2 bg-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">
                    EVENT_IMAGE
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={mgr.handleImageChange}
                    className="border-2 bg-transparent file:mr-4 file:border-0 file:bg-primary file:px-4 file:py-1 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:text-primary-foreground"
                  />
                  {mgr.imagePreview && (
                    <img
                      src={mgr.imagePreview}
                      alt="Preview"
                      className="mt-2 h-40 w-full border-2 border-border object-cover"
                    />
                  )}
                </div>

                <Separator className="border-border" />

                <Button
                  onClick={mgr.addEvent}
                  className="w-full text-[11px] uppercase tracking-[0.3em]"
                  size="lg"
                  disabled={!mgr.form.title || !mgr.form.date || !mgr.form.endDate}
                >
                  <Plus className="mr-2 h-4 w-4" /> CREATE_EVENT
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t-2 border-primary px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            DESIGN_01 // BRUTALIST
          </p>
          <p className="text-[10px] uppercase tracking-widest text-primary">
            ◆ RAW · STARK · UNAPOLOGETIC
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
