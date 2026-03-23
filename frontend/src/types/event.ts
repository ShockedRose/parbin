export interface MeetupEvent {
  id: string
  title: string
  description: string
  date: string
  endDate: string
  location: string
  image: string
  tags: string[]
  /** Canonical URL of the external event page (when set by scraper or admin). */
  sourceEventPage?: string | null
}

export interface EventPayload {
  title: string
  description: string
  date: string
  endDate: string
  location: string
  image: string
  tags: string[]
  sourceEventPage?: string
}

export interface EventSuggestion extends MeetupEvent {
  status: "pending" | "approved" | "rejected"
  sourceEventId: string | null
  createdAt: string
  reviewedAt: string | null
  reviewedBy: string | null
}

export interface AdminSession {
  id: string
  email: string
  createdAt: string
}
