import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useEventManager } from "@/hooks/use-event-manager"
import {
  downloadICS,
  formatDateRange,
  getGoogleCalendarUrl,
} from "@/lib/calendar"
import {
  Calendar,
  Check,
  Download,
  ExternalLink,
  LogIn,
  LogOut,
  MapPin,
  Plus,
  Send,
  Shield,
  Terminal,
  X,
  Zap,
} from "lucide-react"

type EventFormModel = {
  title: string
  description: string
  date: string
  endDate: string
  location: string
  image: string
  tags: string
}

interface EventFormPanelProps {
  title: string
  accent: string
  form: EventFormModel
  preview: string | null
  submitLabel: string
  submitIcon: React.ReactNode
  disabled?: boolean
  busy?: boolean
  onFieldChange: (field: keyof EventFormModel, value: string) => void
  onSubmit: () => void
}

function EventFormPanel({
  title,
  accent,
  form,
  preview,
  submitLabel,
  submitIcon,
  disabled = false,
  busy = false,
  onFieldChange,
  onSubmit,
}: EventFormPanelProps) {
  return (
    <div className="relative border border-border bg-card p-8">
      <div
        className="absolute inset-x-6 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: 0.45,
        }}
      />

      <div className="mb-6 border-b border-border pb-3 text-[10px] tracking-[0.2em] text-muted-foreground">
        ▸ {title}
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-wider text-primary">
            event.title *
          </Label>
          <Input
            value={form.title}
            onChange={(e) => onFieldChange("title", e.target.value)}
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
            value={form.description}
            onChange={(e) => onFieldChange("description", e.target.value)}
            placeholder=">> Describe the event..."
            className="border-border bg-background font-mono"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-primary">
              date.start *
            </Label>
            <Input
              type="datetime-local"
              value={form.date}
              onChange={(e) => onFieldChange("date", e.target.value)}
              className="border-border bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-primary">
              date.end *
            </Label>
            <Input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => onFieldChange("endDate", e.target.value)}
              className="border-border bg-background"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-wider text-primary">
            event.location
          </Label>
          <Input
            value={form.location}
            onChange={(e) => onFieldChange("location", e.target.value)}
            placeholder=">> Venue, City, State"
            className="border-border bg-background font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-wider text-primary">
            event.tags[]
          </Label>
          <Input
            value={form.tags}
            onChange={(e) => onFieldChange("tags", e.target.value)}
            placeholder=">> AI, Workshop, Community"
            className="border-border bg-background font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-wider text-primary">
            event.image_url
          </Label>
          <Input
            value={form.image}
            onChange={(e) => onFieldChange("image", e.target.value)}
            placeholder=">> https://..."
            className="border-border bg-background font-mono"
          />
          {preview && (
            <div className="relative mt-3">
              <img
                src={preview}
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
          onClick={onSubmit}
          className="w-full text-[11px] uppercase tracking-[0.3em] shadow-[0_0_15px_rgba(53,128,255,0.2)]"
          size="lg"
          disabled={disabled || !form.title || !form.date || !form.endDate}
        >
          {submitIcon}
          {busy ? "PROCESSING..." : submitLabel}
        </Button>
      </div>
    </div>
  )
}

function StatusBanner({
  message,
  variant,
}: {
  message: string
  variant: "error" | "notice"
}) {
  const tone =
    variant === "error"
      ? "border-accent/40 bg-accent/10 text-accent"
      : "border-primary/40 bg-primary/10 text-primary"

  return (
    <div className={`mb-6 border px-4 py-3 text-xs tracking-wide ${tone}`}>
      {message}
    </div>
  )
}

export default function MainPage() {
  const mgr = useEventManager()

  return (
    <div className="relative min-h-screen bg-background font-mono text-foreground">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, #3580FF 25%, #3580FF 26%, transparent 27%, transparent 74%, #3580FF 75%, #3580FF 76%, transparent 77%), linear-gradient(90deg, transparent 24%, #3580FF 25%, #3580FF 26%, transparent 27%, transparent 74%, #3580FF 75%, #3580FF 76%, transparent 77%)",
          backgroundSize: "60px 60px",
        }}
      />

      <header className="relative border-b border-border px-6 py-4">
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, #3580FF, rgba(255,255,255,0.25), #FF2D4A, transparent)",
            opacity: 0.6,
          }}
        />
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-[0.25em] text-primary sm:text-2xl">
              PAR<span className="text-accent">BIN</span>
            </h1>
            <p className="text-[10px] tracking-[0.2em] text-muted-foreground">
              ▸ TECH MEETUPS · PANAMÁ
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            {mgr.admin && (
              <div className="text-[10px] tracking-[0.2em] text-primary">
                ADMIN ONLINE // {mgr.admin.email}
              </div>
            )}

            <nav className="flex flex-wrap gap-2">
              <button
                onClick={() => mgr.setView("events")}
                className={`border px-3 py-1.5 text-[11px] uppercase tracking-wider transition-all ${
                  mgr.view === "events"
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(53,128,255,0.2)]"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <Zap className="mr-1 inline h-3 w-3" /> Feed
              </button>
              <button
                onClick={() => mgr.setView("suggest")}
                className={`border px-3 py-1.5 text-[11px] uppercase tracking-wider transition-all ${
                  mgr.view === "suggest"
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(53,128,255,0.2)]"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <Send className="mr-1 inline h-3 w-3" /> Suggest
              </button>
              <button
                onClick={() => mgr.setView("admin")}
                className={`border px-3 py-1.5 text-[11px] uppercase tracking-wider transition-all ${
                  mgr.view === "admin"
                    ? "border-accent bg-accent/10 text-accent shadow-[0_0_10px_rgba(255,45,74,0.2)]"
                    : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
                }`}
              >
                <Terminal className="mr-1 inline h-3 w-3" /> Admin
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        {mgr.error && <StatusBanner message={mgr.error} variant="error" />}
        {mgr.notice && <StatusBanner message={mgr.notice} variant="notice" />}

        {mgr.view === "events" && (
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
        )}

        {mgr.view === "suggest" && (
          <div>
            <div className="mb-10">
              <div className="mb-1 text-[10px] tracking-[0.3em] text-muted-foreground">
                ▸ PUBLIC_UPLINK // COMMUNITY INPUT
              </div>
              <h2 className="font-display text-3xl font-bold tracking-wider sm:text-5xl">
                <span className="text-primary">SUGGEST</span>
                <span className="text-accent">_</span>
                <span className="text-foreground">EVENT</span>
              </h2>
            </div>

            <div className="mx-auto max-w-3xl">
              <EventFormPanel
                title="SUGGESTION_PAYLOAD"
                accent="#3580FF"
                form={mgr.suggestionForm}
                preview={mgr.suggestionImagePreview}
                submitLabel="SUBMIT_FOR_REVIEW"
                submitIcon={<Send className="mr-2 h-4 w-4" />}
                busy={mgr.isSubmitting}
                disabled={mgr.isSubmitting}
                onFieldChange={mgr.updateSuggestionField}
                onSubmit={mgr.submitSuggestion}
              />
            </div>
          </div>
        )}

        {mgr.view === "admin" && (
          <div className="space-y-8">
            <div className="mb-2">
              <div className="mb-1 text-[10px] tracking-[0.3em] text-muted-foreground">
                ▸ ADMIN_CONSOLE // RESTRICTED ACCESS
              </div>
              <h2 className="font-display text-3xl font-bold tracking-wider sm:text-5xl">
                <span className="text-accent">CONTROL</span>
                <span className="text-primary">_</span>
                <span className="text-foreground">PANEL</span>
              </h2>
            </div>

            {!mgr.admin ? (
              <div className="mx-auto max-w-xl border border-border bg-card p-8">
                <div className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-accent">
                  <Shield className="h-4 w-4" />
                  AUTH_REQUIRED
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-wider text-primary">
                      admin.email
                    </Label>
                    <Input
                      type="email"
                      value={mgr.loginForm.email}
                      onChange={(e) =>
                        mgr.updateLoginField("email", e.target.value)
                      }
                      placeholder=">> admin@parbin.local"
                      className="border-border bg-background font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-wider text-primary">
                      admin.password
                    </Label>
                    <Input
                      type="password"
                      value={mgr.loginForm.password}
                      onChange={(e) =>
                        mgr.updateLoginField("password", e.target.value)
                      }
                      placeholder=">> Enter password"
                      className="border-border bg-background font-mono"
                    />
                  </div>

                  <Button
                    onClick={mgr.login}
                    className="w-full text-[11px] uppercase tracking-[0.3em]"
                    size="lg"
                    disabled={
                      mgr.isAuthenticating ||
                      !mgr.loginForm.email ||
                      !mgr.loginForm.password
                    }
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {mgr.isAuthenticating ? "AUTHENTICATING..." : "LOGIN_ADMIN"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-[10px] tracking-[0.25em] text-primary">
                        ADMIN_SESSION_ACTIVE
                      </div>
                      <div className="mt-1 text-sm text-foreground">
                        {mgr.admin.email}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={mgr.logout}
                      disabled={mgr.isAuthenticating}
                      className="text-[10px] uppercase tracking-[0.2em]"
                    >
                      <LogOut className="mr-2 h-3 w-3" />
                      {mgr.isAuthenticating ? "CLOSING..." : "LOGOUT"}
                    </Button>
                  </div>

                  <EventFormPanel
                    title="EVENT_CREATION_PIPELINE"
                    accent="#FF2D4A"
                    form={mgr.eventForm}
                    preview={mgr.eventImagePreview}
                    submitLabel="DEPLOY_EVENT"
                    submitIcon={<Plus className="mr-2 h-4 w-4" />}
                    busy={mgr.isSubmitting}
                    disabled={mgr.isSubmitting}
                    onFieldChange={mgr.updateEventField}
                    onSubmit={mgr.addEvent}
                  />
                </div>

                <div className="border border-border bg-card p-6">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] tracking-[0.25em] text-accent">
                        REVIEW_QUEUE
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Pending suggestions can be converted directly into events.
                      </div>
                    </div>
                    <div className="text-[10px] tracking-[0.2em] text-primary">
                      {mgr.suggestions.length} ITEMS
                    </div>
                  </div>

                  {mgr.isSuggestionsLoading ? (
                    <div className="border border-border px-4 py-8 text-center text-[11px] tracking-[0.25em] text-primary">
                      LOADING_QUEUE...
                    </div>
                  ) : mgr.suggestions.length === 0 ? (
                    <div className="border border-border px-4 py-8 text-center text-[11px] tracking-[0.25em] text-muted-foreground">
                      NO_SUGGESTIONS_AVAILABLE
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mgr.suggestions.map((suggestion) => {
                        const isBusy = mgr.activeSuggestionId === suggestion.id
                        const isPending = suggestion.status === "pending"

                        return (
                          <div
                            key={suggestion.id}
                            className="border border-border bg-background/40 p-4"
                          >
                            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <h3 className="font-display text-lg tracking-wide">
                                  {suggestion.title}
                                </h3>
                                <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 text-primary" />
                                    {formatDateRange(
                                      suggestion.date,
                                      suggestion.endDate
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3 text-accent" />
                                    {suggestion.location || "No location provided"}
                                  </div>
                                </div>
                              </div>

                              <Badge
                                variant="outline"
                                className={
                                  suggestion.status === "pending"
                                    ? "border-primary/40 text-primary"
                                    : suggestion.status === "approved"
                                      ? "border-green-500/40 text-green-300"
                                      : "border-accent/40 text-accent"
                                }
                              >
                                {suggestion.status.toUpperCase()}
                              </Badge>
                            </div>

                            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                              {suggestion.description || "No description provided."}
                            </p>

                            <div className="mb-4 flex flex-wrap gap-1.5">
                              {suggestion.tags.map((tag) => (
                                <Badge
                                  key={`${suggestion.id}-${tag}`}
                                  variant="outline"
                                  className="border-primary/20 bg-background text-[10px] text-primary"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {suggestion.image && (
                              <img
                                src={suggestion.image}
                                alt={suggestion.title}
                                className="mb-4 h-32 w-full border border-border object-cover"
                                style={{
                                  filter:
                                    "saturate(0.65) brightness(0.78) contrast(1.08)",
                                }}
                              />
                            )}

                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                onClick={() => mgr.approveSuggestion(suggestion.id)}
                                disabled={!isPending || isBusy}
                                className="text-[10px] uppercase tracking-[0.2em]"
                              >
                                <Check className="mr-1 h-3 w-3" />
                                {isBusy ? "PROCESSING..." : "APPROVE"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => mgr.rejectSuggestion(suggestion.id)}
                                disabled={!isPending || isBusy}
                                className="text-[10px] uppercase tracking-[0.2em]"
                              >
                                <X className="mr-1 h-3 w-3" />
                                REJECT
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground">
            PARBIN // PANAMÁ
          </p>
          <div className="flex items-center gap-3">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <p className="text-[10px] tracking-[0.2em] text-primary">
              SYSTEM ONLINE
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
