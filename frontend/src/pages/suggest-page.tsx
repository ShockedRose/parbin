import { useNavigate } from "@tanstack/react-router"

import { EventFormPanel } from "@/components/event-form-panel"
import { PageHeader } from "@/components/page-header"
import { useEventManagerContext } from "@/event-manager-context"
import { Send } from "lucide-react"

export function SuggestPage() {
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
        title="Suggest an event"
        description="Know about a meetup that isn't listed? Send it over. An admin reviews every suggestion before it goes live."
      />

      <EventFormPanel
        title="Event details"
        description="Fields marked with * are required."
        form={mgr.suggestionForm}
        preview={mgr.suggestionImagePreview}
        submitLabel="Send for review"
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
