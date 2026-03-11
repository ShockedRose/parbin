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
  Sparkles,
  PartyPopper,
} from "lucide-react"

const theme = {
  "--color-background": "#fffef5",
  "--color-foreground": "#2d2250",
  "--color-card": "#ffffff",
  "--color-card-foreground": "#2d2250",
  "--color-popover": "#ffffff",
  "--color-popover-foreground": "#2d2250",
  "--color-primary": "#ff6b6b",
  "--color-primary-foreground": "#ffffff",
  "--color-secondary": "#e0f7f5",
  "--color-secondary-foreground": "#2d2250",
  "--color-muted": "#f8f5ff",
  "--color-muted-foreground": "#7c6fa6",
  "--color-accent": "#4ecdc4",
  "--color-accent-foreground": "#ffffff",
  "--color-destructive": "#ff4757",
  "--color-border": "#e8e0f5",
  "--color-input": "#faf8ff",
  "--color-ring": "#ff6b6b",
  "--radius-sm": "0.75rem",
  "--radius-md": "1rem",
  "--radius-lg": "1.25rem",
  "--radius-xl": "1.5rem",
  "--radius-2xl": "1.75rem",
  "--radius-3xl": "2rem",
  "--radius-4xl": "2.5rem",
} as React.CSSProperties

const cardAccents = [
  { bg: "#fff0f0", border: "#ffcece", shadow: "rgba(255,107,107,0.12)" },
  { bg: "#e0f7f5", border: "#b2ece8", shadow: "rgba(78,205,196,0.12)" },
  { bg: "#f0eeff", border: "#d4ccff", shadow: "rgba(139,92,246,0.12)" },
  { bg: "#fff8e0", border: "#ffe8a3", shadow: "rgba(251,191,36,0.12)" },
  { bg: "#e8fff0", border: "#b2f5d0", shadow: "rgba(52,211,153,0.12)" },
]

export default function Design5() {
  const mgr = useEventManager()

  return (
    <div
      style={{ ...theme, fontFamily: "'Quicksand', sans-serif" }}
      className="min-h-screen bg-background text-foreground"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "#ff6b6b" }}
        />
        <div
          className="absolute -right-32 top-1/3 h-80 w-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "#4ecdc4" }}
        />
        <div
          className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full opacity-15 blur-3xl"
          style={{ background: "#a78bfa" }}
        />
      </div>

      <header className="relative border-b border-border/50 px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "#ff6b6b" }}
            >
              <PartyPopper className="h-5 w-5 text-white" />
            </div>
            <h1
              style={{ fontFamily: "'Fredoka', sans-serif" }}
              className="text-2xl font-semibold"
            >
              Tech
              <span style={{ color: "#ff6b6b" }}>Meetups</span>
            </h1>
          </div>
          <nav className="flex gap-2">
            <Button
              variant={mgr.view === "events" ? "default" : "secondary"}
              size="sm"
              onClick={() => mgr.setView("events")}
              className="rounded-full text-sm font-semibold"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Events
            </Button>
            <Button
              variant={mgr.view === "admin" ? "default" : "secondary"}
              size="sm"
              onClick={() => mgr.setView("admin")}
              className="rounded-full text-sm font-semibold"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Create
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-10">
        {mgr.view === "events" ? (
          <div>
            <div className="mb-10 text-center">
              <div
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, #ff6b6b, #4ecdc4)",
                }}
              >
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h2
                style={{ fontFamily: "'Fredoka', sans-serif" }}
                className="text-3xl font-bold sm:text-4xl"
              >
                What&apos;s{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #ff6b6b, #a78bfa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Happening
                </span>
              </h2>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                Discover awesome tech events near you. Learn, connect, and have
                fun with fellow developers!
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mgr.events.map((event, i) => {
                const accent = cardAccents[i % cardAccents.length]
                return (
                  <Card
                    key={event.id}
                    className="group overflow-hidden border-2 transition-all duration-300 hover:-translate-y-2"
                    style={{
                      borderColor: accent.border,
                      boxShadow: `0 4px 20px ${accent.shadow}`,
                    }}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(to top, ${accent.bg}, transparent)`,
                        }}
                      />
                      <div className="absolute bottom-2 left-3 flex flex-wrap gap-1.5">
                        {event.tags.map((tag, ti) => (
                          <Badge
                            key={tag}
                            className="rounded-full border-0 px-2.5 py-0.5 text-[11px] font-semibold text-foreground"
                            style={{
                              background:
                                cardAccents[(i + ti + 1) % cardAccents.length]
                                  .bg,
                            }}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                        <CalendarDays
                          className="h-3.5 w-3.5"
                          style={{ color: "#ff6b6b" }}
                        />
                        <span style={{ color: "#ff6b6b" }}>
                          {formatDate(event.date)}
                        </span>
                        <span className="text-muted-foreground">
                          {formatTime(event.date)}
                        </span>
                      </div>

                      <h3
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                        className="mb-1.5 text-lg font-semibold leading-snug"
                      >
                        {event.title}
                      </h3>

                      <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin
                          className="h-3 w-3 shrink-0"
                          style={{ color: "#4ecdc4" }}
                        />
                        <span className="truncate">{event.location}</span>
                      </div>

                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {event.description}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 rounded-full text-xs font-semibold"
                          asChild
                        >
                          <a
                            href={getGoogleCalendarUrl(event)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Add to Cal
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => downloadICS(event)}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-10 text-center">
              <div
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #a78bfa, #ff6b6b)",
                }}
              >
                <Plus className="h-7 w-7 text-white" />
              </div>
              <h2
                style={{ fontFamily: "'Fredoka', sans-serif" }}
                className="text-3xl font-bold sm:text-4xl"
              >
                Create{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #4ecdc4, #a78bfa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Event
                </span>
              </h2>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                Share something amazing with the community! Fill in the details
                and let&apos;s get people excited.
              </p>
            </div>

            <Card
              className="mx-auto max-w-2xl border-2 shadow-lg"
              style={{
                borderColor: "#e8e0f5",
                boxShadow: "0 8px 30px rgba(139,92,246,0.08)",
              }}
            >
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Fredoka', sans-serif" }}
                      className="text-sm font-semibold"
                    >
                      Event Name *
                    </Label>
                    <Input
                      value={mgr.form.title}
                      onChange={(e) =>
                        mgr.updateField("title", e.target.value)
                      }
                      placeholder="Give your event a catchy name!"
                      className="rounded-xl bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Fredoka', sans-serif" }}
                      className="text-sm font-semibold"
                    >
                      What&apos;s it about?
                    </Label>
                    <Textarea
                      rows={4}
                      value={mgr.form.description}
                      onChange={(e) =>
                        mgr.updateField("description", e.target.value)
                      }
                      placeholder="Tell everyone what makes this event special..."
                      className="rounded-xl bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                        className="text-sm font-semibold"
                      >
                        Starts *
                      </Label>
                      <Input
                        type="datetime-local"
                        value={mgr.form.date}
                        onChange={(e) =>
                          mgr.updateField("date", e.target.value)
                        }
                        className="rounded-xl bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                        className="text-sm font-semibold"
                      >
                        Ends *
                      </Label>
                      <Input
                        type="datetime-local"
                        value={mgr.form.endDate}
                        onChange={(e) =>
                          mgr.updateField("endDate", e.target.value)
                        }
                        className="rounded-xl bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Fredoka', sans-serif" }}
                      className="text-sm font-semibold"
                    >
                      Where?
                    </Label>
                    <Input
                      value={mgr.form.location}
                      onChange={(e) =>
                        mgr.updateField("location", e.target.value)
                      }
                      placeholder="Venue name, City"
                      className="rounded-xl bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Fredoka', sans-serif" }}
                      className="text-sm font-semibold"
                    >
                      Tags
                    </Label>
                    <Input
                      value={mgr.form.tags}
                      onChange={(e) =>
                        mgr.updateField("tags", e.target.value)
                      }
                      placeholder="React, Fun, Beginner-friendly"
                      className="rounded-xl bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      style={{ fontFamily: "'Fredoka', sans-serif" }}
                      className="text-sm font-semibold"
                    >
                      Cover Photo
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={mgr.handleImageChange}
                      className="rounded-xl bg-background file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground"
                    />
                    {mgr.imagePreview && (
                      <img
                        src={mgr.imagePreview}
                        alt="Preview"
                        className="mt-3 h-44 w-full rounded-2xl object-cover"
                      />
                    )}
                  </div>

                  <Separator />

                  <Button
                    onClick={mgr.addEvent}
                    className="w-full rounded-full text-sm font-bold"
                    size="lg"
                    disabled={
                      !mgr.form.title ||
                      !mgr.form.date ||
                      !mgr.form.endDate
                    }
                  >
                    <PartyPopper className="mr-2 h-4 w-4" /> Publish Event!
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                background: "linear-gradient(135deg, #ff6b6b, #4ecdc4)",
              }}
            />
            Design 05 · Bubbly
          </div>
          <p
            className="text-xs font-semibold"
            style={{ color: "#ff6b6b" }}
          >
            Colorful · Fun · Friendly
          </p>
        </div>
      </footer>
    </div>
  )
}
