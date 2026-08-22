export const queryKeys = {
  tags: ["tags"] as const,
  events: ["events"] as const,
  pastEvents: ["events", "past"] as const,
  event: (id: string) => ["events", "detail", id] as const,
  session: ["auth", "session"] as const,
  suggestions: ["suggestions"] as const,
  dashboard: ["admin", "dashboard"] as const,
}
