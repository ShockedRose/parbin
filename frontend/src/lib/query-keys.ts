export const queryKeys = {
  events: ["events"] as const,
  pastEvents: ["events", "past"] as const,
  event: (id: string) => ["events", "detail", id] as const,
  session: ["auth", "session"] as const,
  suggestions: ["suggestions"] as const,
}
