export interface LabeledCount {
  label: string
  count: number
}

export interface MonthCount {
  month: string
  count: number
}

export interface SuggestionMonthCount {
  month: string
  pending: number
  approved: number
  rejected: number
}

export interface DashboardSummary {
  totalEvents: number
  upcomingEvents: number
  pastEvents: number
  eventsWithSourcePage: number
  eventsWithoutSourcePage: number
  totalSuggestions: number
  pendingSuggestions: number
  approvedSuggestions: number
  rejectedSuggestions: number
  sourcedSuggestions: number
  communitySuggestions: number
  approvalRate: number | null
  avgReviewHours: number | null
}

export interface AdminDashboard {
  timezone: string
  summary: DashboardSummary
  eventsByMonth: MonthCount[]
  suggestionsByMonth: SuggestionMonthCount[]
  topTags: LabeledCount[]
  topLocations: LabeledCount[]
  eventsByWeekday: LabeledCount[]
  eventSourceMix: LabeledCount[]
  suggestionSourceMix: LabeledCount[]
  suggestionStatusMix: LabeledCount[]
}
