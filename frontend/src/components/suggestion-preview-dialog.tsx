import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Check, X } from "lucide-react"

import { EventDetailsView } from "@/components/event-details-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  SUGGESTION_STATUS_LABEL_KEYS,
  SUGGESTION_STATUS_STYLES,
} from "@/lib/suggestion-status"
import type { EventSuggestion } from "@/types/event"

type Decision = "approve" | "reject"

export function SuggestionPreviewDialog({
  suggestion,
  open,
  onOpenChange,
  onApprove,
  onReject,
  busy = false,
}: {
  suggestion: EventSuggestion | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (id: string) => Promise<boolean>
  onReject: (id: string) => Promise<boolean>
  busy?: boolean
}) {
  const { t } = useTranslation()
  const [decision, setDecision] = useState<Decision | null>(null)

  useEffect(() => {
    if (!open) {
      setDecision(null)
    }
  }, [open])

  if (!suggestion) {
    return null
  }

  const isPending = suggestion.status === "pending"
  const isBusy = busy || decision !== null

  const decide = async (nextDecision: Decision) => {
    setDecision(nextDecision)

    try {
      const wasReviewed =
        nextDecision === "approve"
          ? await onApprove(suggestion.id)
          : await onReject(suggestion.id)

      if (wasReviewed) {
        onOpenChange(false)
      }
    } finally {
      setDecision(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] w-full flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-5xl">
        <DialogHeader className="flex-col items-start gap-2 border-b border-border px-5 py-4 pr-14 text-left sm:flex-row sm:items-center sm:gap-3">
          <div className="min-w-0 flex-1">
            <DialogTitle className="font-serif text-lg font-semibold">
              {t("pages.admin.previewTitle")}
            </DialogTitle>
            <DialogDescription className="mt-1 line-clamp-1">
              {suggestion.title}
            </DialogDescription>
          </div>
          <Badge
            variant="outline"
            className={SUGGESTION_STATUS_STYLES[suggestion.status]}
          >
            {t(SUGGESTION_STATUS_LABEL_KEYS[suggestion.status])}
          </Badge>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 p-3 sm:p-6">
          <EventDetailsView event={suggestion} />
        </div>

        <DialogFooter className="mx-0 mb-0 flex-col gap-3 rounded-none border-t bg-card px-5 py-4 sm:flex-row sm:items-center">
          {isPending ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("pages.admin.previewHint")}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-lg px-3">
                {t("pages.admin.previewClose")}
              </Button>
            </DialogClose>
            {isPending ? (
              <>
                <Button
                  variant="destructive"
                  className="rounded-lg px-3"
                  disabled={isBusy}
                  onClick={() => {
                    void decide("reject")
                  }}
                >
                  <X />
                  {decision === "reject"
                    ? t("common.working")
                    : t("pages.admin.reject")}
                </Button>
                <Button
                  className="rounded-lg px-3"
                  disabled={isBusy}
                  onClick={() => {
                    void decide("approve")
                  }}
                >
                  <Check />
                  {decision === "approve"
                    ? t("common.working")
                    : t("pages.admin.approve")}
                </Button>
              </>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
