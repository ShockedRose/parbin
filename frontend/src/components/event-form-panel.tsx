import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { TagInput } from "@/components/tag-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { EventFormFields } from "@/types/event"

interface EventFormPanelProps {
  title: string
  description?: string
  form: EventFormFields
  preview: string | null
  submitLabel: string
  submitIcon: ReactNode
  disabled?: boolean
  busy?: boolean
  allowCreateTags?: boolean
  onFieldChange: <K extends keyof EventFormFields>(
    field: K,
    value: EventFormFields[K]
  ) => void
  onSubmit: () => void
}

export function EventFormPanel({
  title,
  description,
  form,
  preview,
  submitLabel,
  submitIcon,
  disabled = false,
  busy = false,
  allowCreateTags = false,
  onFieldChange,
  onSubmit,
}: EventFormPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="font-serif text-xl font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label>{t("eventForm.titleLabel")}</Label>
          <Input
            value={form.title}
            onChange={(e) => onFieldChange("title", e.target.value)}
            placeholder={t("eventForm.titlePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("eventForm.descriptionLabel")}</Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => onFieldChange("description", e.target.value)}
            placeholder={t("eventForm.descriptionPlaceholder")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("eventForm.starts")}</Label>
            <Input
              type="datetime-local"
              value={form.date}
              onChange={(e) => onFieldChange("date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("eventForm.ends")}</Label>
            <Input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => onFieldChange("endDate", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("eventForm.location")}</Label>
          <Input
            value={form.location}
            onChange={(e) => onFieldChange("location", e.target.value)}
            placeholder={t("eventForm.locationPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("eventForm.eventPage")}</Label>
          <Input
            type="url"
            inputMode="url"
            value={form.sourceEventPage}
            onChange={(e) => onFieldChange("sourceEventPage", e.target.value)}
            placeholder={t("eventForm.eventPagePlaceholder")}
          />
          <p className="text-xs text-muted-foreground">
            {t("eventForm.eventPageHint")}
          </p>
        </div>

        <div className="space-y-2">
          <Label>{t("eventForm.tags")}</Label>
          <TagInput
            value={form.tags}
            onChange={(tags) => onFieldChange("tags", tags)}
            allowCreate={allowCreateTags}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("eventForm.imageUrl")}</Label>
          <Input
            value={form.image}
            onChange={(e) => onFieldChange("image", e.target.value)}
            placeholder="https://…"
          />
          {preview && (
            <div className="relative mt-3 overflow-hidden rounded-xl border border-border">
              <img
                src={preview}
                alt={t("eventForm.previewAlt")}
                className="h-40 w-full object-cover"
              />
              <span className="absolute top-2 right-2 rounded-md bg-background/80 px-2 py-0.5 text-xs text-muted-foreground">
                {t("common.preview")}
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={onSubmit}
          className="mt-2 h-11 w-full rounded-xl text-[15px]"
          disabled={disabled || !form.title || !form.date || !form.endDate}
        >
          {submitIcon}
          {busy ? t("eventForm.working") : submitLabel}
        </Button>
      </div>
    </div>
  )
}
