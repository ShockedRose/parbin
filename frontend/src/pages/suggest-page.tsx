import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { EventFormPanel } from "@/components/event-form-panel"
import { PageHeader } from "@/components/page-header"
import { useEventManagerContext } from "@/event-manager-context"
import { Send } from "lucide-react"

export function SuggestPage() {
  const { t } = useTranslation()
  const mgr = useEventManagerContext()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    const wasSubmitted = await mgr.submitSuggestion()

    if (wasSubmitted) {
      await navigate({ to: "/" })
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={t("pages.suggest.title")}
        description={t("pages.suggest.description")}
      />

      <EventFormPanel
        title={t("pages.suggest.formTitle")}
        description={t("pages.suggest.formDescription")}
        form={mgr.suggestionForm}
        preview={mgr.suggestionImagePreview}
        submitLabel={t("pages.suggest.submit")}
        submitIcon={<Send />}
        busy={mgr.isSubmitting}
        disabled={mgr.isSubmitting}
        onFieldChange={mgr.updateSuggestionField}
        onSubmit={() => {
          void handleSubmit()
        }}
        allowCreateTags={false}
      />
    </div>
  )
}
