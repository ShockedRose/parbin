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
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  MapPin,
  Plus,
  Download,
  ExternalLink,
  Terminal,
  Zap,
} from "lucide-react"

const theme = {
  "--color-background": "#050a18",
  "--color-foreground": "#e0e8ff",
  "--color-card": "#0a1628",
  "--color-card-foreground": "#e0e8ff",
  "--color-popover": "#0a1628",
  "--color-popover-foreground": "#e0e8ff",
  "--color-primary": "#00f0ff",
  "--color-primary-foreground": "#050a18",
  "--color-secondary": "#111d35",
  "--color-secondary-foreground": "#00f0ff",
  "--color-muted": "#111d35",
  "--color-muted-foreground": "#4a6080",
  "--color-accent": "#ff00aa",
  "--color-accent-foreground": "#050a18",
  "--color-destructive": "#ff2244",
  "--color-border": "#1a2d50",
  "--color-input": "#0d1a30",
  "--color-ring": "#00f0ff",
  "--radius-sm": "0.15rem",
  "--radius-md": "0.2rem",
  "--radius-lg": "0.25rem",
  "--radius-xl": "0.35rem",
  "--radius-2xl": "0.45rem",
  "--radius-3xl": "0.55rem",
  "--radius-4xl": "0.65rem",
} as React.CSSProperties

export default function Design3() {
  const mgr = useEventManager()

  return (
    <div
      style={{ ...theme, fontFamily: "'Share Tech Mono', monospace" }}
      className="relative min-h-screen bg-background text-foreground"
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, #00f0ff 25%, #00f0ff 26%, transparent 27%, transparent 74%, #00f0ff 75%, #00f0ff 76%, transparent 77%), linear-gradient(90deg, transparent 24%, #00f0ff 25%, #00f0ff 26%, transparent 27%, transparent 74%, #00f0ff 75%, #00f0ff 76%, transparent 77%)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-[0.04]">
        <div className="animate-[scanline_8s_linear_infinite] h-[2px] w-full bg-[#00f0ff]" />
      </div>

      <header className="relative border-b border-border px-6 py-4">
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, #00f0ff, #ff00aa, #00f0ff, transparent)",
            opacity: 0.5,
          }}
        />
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1
              style={{ fontFamily: "'Orbitron', sans-serif" }}
              className="text-xl font-bold tracking-[0.3em] text-primary sm:text-2xl"
            >
              NEXUS<span className="text-accent">_</span>EVENTS
            </h1>
            <p className="text-[10px] tracking-[0.2em] text-muted-foreground">
              ▸ TECH MEETUP NETWORK v2.6
            </p>
          </div>
          <nav className="flex gap-2">
            <button
              onClick={() => mgr.setView("events")}
              className={`border px-3 py-1.5 text-[11px] uppercase tracking-wider transition-all ${
                mgr.view === "events"
                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <Zap className="mr-1 inline h-3 w-3" /> Feed
            </button>
            <button
              onClick={() => mgr.setView("admin")}
              className={`border px-3 py-1.5 text-[11px] uppercase tracking-wider transition-all ${
                mgr.view === "admin"
                  ? "border-accent bg-accent/10 text-accent shadow-[0_0_10px_rgba(255,0,170,0.2)]"
                  : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
              }`}
            >
              <Terminal className="mr-1 inline h-3 w-3" /> Admin
            </button>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        {mgr.view === "events" ? (
          <div>
            <div className="mb-10">
              <div className="mb-1 text-[10px] tracking-[0.3em] text-muted-foreground">
                ▸ ACTIVE_FEED // {mgr.events.length} NODES DETECTED
              </div>
              <h2
                style={{ fontFamily: "'Orbitron', sans-serif" }}
                className="text-3xl font-bold tracking-wider sm:text-5xl"
              >
                <span className="text-primary">EVENT</span>
                <span className="text-accent">_</span>
                <span className="text-foreground">STREAM</span>
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {mgr.events.map((event, i) => (
                <div
                  key={event.id}
                  className="group relative overflow-hidden border border-border bg-card transition-all duration-300 hover:border-primary"
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(0,240,255,0.05), inset 0 1px 0 rgba(0,240,255,0.05)",
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      boxShadow:
                        "0 0 20px rgba(0,240,255,0.1), inset 0 0 20px rgba(0,240,255,0.03)",
                    }}
                  />

                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover"
                      style={{ filter: "saturate(0.6) brightness(0.7) contrast(1.2)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a18] via-[#050a18]/50 to-transparent" />
                    <div className="absolute right-3 top-3 border border-primary/30 bg-background/80 px-2 py-0.5 text-[10px] text-primary backdrop-blur-sm">
                      NODE_{String(i + 1).padStart(3, "0")}
                    </div>
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                      {event.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-primary/30 bg-background/60 text-[10px] text-primary backdrop-blur-sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3
                      style={{ fontFamily: "'Orbitron', sans-serif" }}
                      className="mb-2 text-base font-semibold tracking-wide"
                    >
                      {event.title}
                    </h3>

                    <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-primary" />
                        {formatDateRange(event.date, event.endDate)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-accent" />
                        {event.location}
                      </div>
                    </div>

                    <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 text-[10px] uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.15)]"
                        asChild
                      >
                        <a
                          href={getGoogleCalendarUrl(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          SYNC
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] uppercase tracking-wider"
                        onClick={() => downloadICS(event)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-10">
              <div className="mb-1 text-[10px] tracking-[0.3em] text-muted-foreground">
                ▸ ADMIN_CONSOLE // RESTRICTED ACCESS
              </div>
              <h2
                style={{ fontFamily: "'Orbitron', sans-serif" }}
                className="text-3xl font-bold tracking-wider sm:text-5xl"
              >
                <span className="text-accent">NEW</span>
                <span className="text-primary">_</span>
                <span className="text-foreground">EVENT</span>
              </h2>
            </div>

            <div className="mx-auto max-w-2xl border border-border bg-card p-8">
              <div
                className="absolute -mt-8 ml-[-33px] h-px w-[calc(100%+66px)]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #ff00aa, transparent)",
                  opacity: 0.3,
                }}
              />

              <div className="mb-6 border-b border-border pb-3 text-[10px] tracking-[0.2em] text-accent">
                ▸ INPUT_FIELDS
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-wider text-primary">
                    event.title *
                  </Label>
                  <Input
                    value={mgr.form.title}
                    onChange={(e) => mgr.updateField("title", e.target.value)}
                    placeholder=">> Enter event title"
                    className="border-border bg-background font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-wider text-primary">
                    event.description
                  </Label>
                  <Textarea
                    rows={4}
                    value={mgr.form.description}
                    onChange={(e) =>
                      mgr.updateField("description", e.target.value)
                    }
                    placeholder=">> Describe the event..."
                    className="border-border bg-background font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-wider text-primary">
                      date.start *
                    </Label>
                    <Input
                      type="datetime-local"
                      value={mgr.form.date}
                      onChange={(e) => mgr.updateField("date", e.target.value)}
                      className="border-border bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-wider text-primary">
                      date.end *
                    </Label>
                    <Input
                      type="datetime-local"
                      value={mgr.form.endDate}
                      onChange={(e) =>
                        mgr.updateField("endDate", e.target.value)
                      }
                      className="border-border bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-wider text-primary">
                    event.location
                  </Label>
                  <Input
                    value={mgr.form.location}
                    onChange={(e) =>
                      mgr.updateField("location", e.target.value)
                    }
                    placeholder=">> Venue, City, State"
                    className="border-border bg-background font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-wider text-primary">
                    event.tags[]
                  </Label>
                  <Input
                    value={mgr.form.tags}
                    onChange={(e) => mgr.updateField("tags", e.target.value)}
                    placeholder=">> AI, Machine Learning, Workshop"
                    className="border-border bg-background font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-wider text-primary">
                    event.image
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={mgr.handleImageChange}
                    className="border-border bg-background file:mr-4 file:border-0 file:bg-accent file:px-4 file:py-1 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:text-accent-foreground"
                  />
                  {mgr.imagePreview && (
                    <div className="relative mt-3">
                      <img
                        src={mgr.imagePreview}
                        alt="Preview"
                        className="h-40 w-full border border-border object-cover"
                        style={{
                          filter: "saturate(0.6) brightness(0.8) contrast(1.1)",
                        }}
                      />
                      <div className="absolute right-2 top-2 bg-background/80 px-2 py-0.5 text-[10px] text-primary">
                        PREVIEW
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="border-border" />

                <Button
                  onClick={mgr.addEvent}
                  className="w-full text-[11px] uppercase tracking-[0.3em] shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  size="lg"
                  disabled={
                    !mgr.form.title || !mgr.form.date || !mgr.form.endDate
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> DEPLOY_EVENT
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground">
            DESIGN_03 // NEXUS
          </p>
          <div className="flex items-center gap-3">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <p className="text-[10px] tracking-[0.2em] text-primary">
              SYSTEM ONLINE
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  )
}
