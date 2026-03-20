import { useNavigate } from "@tanstack/react-router"

import { EventFormPanel } from "@/components/event-form-panel"
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
    <div>
      <div className="mb-10">
        <div className="mb-1 text-[10px] text-muted-foreground">
          ▸ PUBLIC_UPLINK // COMMUNITY INPUT
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
          <span className="text-foreground">SUGGEST_</span>
          <span className="text-primary">EVENT</span>
        </h2>
      </div>

      <div className="mx-auto max-w-3xl">
        <EventFormPanel
          title="SUGGESTION_PAYLOAD"
          accent="var(--primary)"
          form={mgr.suggestionForm}
          preview={mgr.suggestionImagePreview}
          submitLabel="SUBMIT_FOR_REVIEW"
          submitIcon={<Send className="mr-2 h-4 w-4" />}
          busy={mgr.isSubmitting}
          disabled={mgr.isSubmitting}
          onFieldChange={mgr.updateSuggestionField}
          onSubmit={() => {
            void handleSubmit()
          }}
        />
      </div>
    </div>
  )
}
