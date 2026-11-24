import type { EventSuggestion } from "@/types/event"

export const SUGGESTION_STATUS_STYLES: Record<
  EventSuggestion["status"],
  string
> = {
  pending: "border-primary/40 bg-primary/10 text-foreground",
  approved: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  rejected: "border-accent/40 bg-accent/10 text-foreground",
}

export const SUGGESTION_STATUS_LABEL_KEYS: Record<
  EventSuggestion["status"],
  string
> = {
  pending: "status.pending",
  approved: "status.approved",
  rejected: "status.rejected",
}
