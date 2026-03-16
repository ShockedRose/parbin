import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEventManagerContext } from "@/event-manager-context"
import {
  downloadICS,
  formatDateRange,
  getGoogleCalendarUrl,
} from "@/lib/calendar"
import {
  Calendar,
  Download,
  ExternalLink,
  MapPin,
} from "lucide-react"

export function EventsPage() {
  const mgr = useEventManagerContext()

  return (
    <div>
      <div className="mb-10">
        <div className="mb-1 text-[10px] tracking-[0.3em] text-muted-foreground">
          ▸ ACTIVE_FEED // {mgr.events.length} NODES DETECTED
        </div>
        <h2 className="font-display text-3xl font-bold tracking-wider sm:text-5xl">
          <span className="text-primary">EVENT</span>
          <span className="text-accent">_</span>
          <span className="text-foreground">STREAM</span>
        </h2>
      </div>

      {mgr.isBootstrapping || mgr.isEventsLoading ? (
        <div className="border border-border bg-card px-6 py-12 text-center text-xs tracking-[0.3em] text-primary">
          SYNCING_EVENT_FEED...
        </div>
      ) : mgr.events.length === 0 ? (
        <div className="border border-border bg-card px-6 py-12 text-center text-xs tracking-[0.3em] text-muted-foreground">
          NO_EVENTS_FOUND
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {mgr.events.map((event, i) => (
            <div
              key={event.id}
              className="group relative overflow-hidden border border-border bg-card transition-all duration-300 hover:border-primary"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(53,128,255,0.05), inset 0 1px 0 rgba(53,128,255,0.05)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  boxShadow:
                    "0 0 20px rgba(53,128,255,0.1), inset 0 0 20px rgba(53,128,255,0.03)",
                }}
              />

              <div className="relative h-40 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover"
                  style={{
                    filter: "saturate(0.6) brightness(0.7) contrast(1.2)",
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
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
                <h3 className="font-display mb-2 text-base font-semibold tracking-wide">
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

                <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {event.description}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 text-[10px] uppercase tracking-wider shadow-[0_0_10px_rgba(53,128,255,0.15)]"
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
      )}
    </div>
  )
}
