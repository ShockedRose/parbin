import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

type EventFormModel = {
  title: string
  description: string
  date: string
  endDate: string
  location: string
  sourceEventPage: string
  image: string
  tags: string
}

interface EventFormPanelProps {
  title: string
  accent: string
  form: EventFormModel
  preview: string | null
  submitLabel: string
  submitIcon: ReactNode
  disabled?: boolean
  busy?: boolean
  onFieldChange: (field: keyof EventFormModel, value: string) => void
  onSubmit: () => void
}

export function EventFormPanel({
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
    <div className="relative rounded-xl border border-border bg-card p-8">
      <div
        className="absolute inset-x-6 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: 0.45,
        }}
      />

      <div className="mb-6 border-b border-border pb-3 text-[10px] text-muted-foreground">
        ▸ {title}
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-[11px] text-primary uppercase">
            event.title *
          </Label>
          <Input
            value={form.title}
            onChange={(e) => onFieldChange("title", e.target.value)}
            placeholder=">> Enter event title"
            className="border-border bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] text-primary uppercase">
            event.description
          </Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => onFieldChange("description", e.target.value)}
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
              value={form.date}
              onChange={(e) => onFieldChange("date", e.target.value)}
              className="border-border bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] text-primary uppercase">
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
          <Label className="text-[11px] text-primary uppercase">
            event.location
          </Label>
          <Input
            value={form.location}
            onChange={(e) => onFieldChange("location", e.target.value)}
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
            value={form.sourceEventPage}
            onChange={(e) => onFieldChange("sourceEventPage", e.target.value)}
            placeholder=">> https://… (optional external listing)"
            className="border-border bg-background"
          />
          <p className="text-[10px] text-muted-foreground">
            Optional link to the original event page (e.g. Meetup, Eventbrite).
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] text-primary uppercase">
            event.tags[]
          </Label>
          <Input
            value={form.tags}
            onChange={(e) => onFieldChange("tags", e.target.value)}
            placeholder=">> AI, Workshop, Community"
            className="border-border bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] text-primary uppercase">
            event.image_url
          </Label>
          <Input
            value={form.image}
            onChange={(e) => onFieldChange("image", e.target.value)}
            placeholder=">> https://..."
            className="border-border bg-background"
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
              <div className="absolute top-2 right-2 bg-background/80 px-2 py-0.5 text-[10px] text-primary">
                PREVIEW
              </div>
            </div>
          )}
        </div>

        <Separator className="border-border" />

        <Button
          onClick={onSubmit}
          className="w-full text-[11px] uppercase parbin-glow-primary-sm"
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
