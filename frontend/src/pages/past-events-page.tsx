import { useQuery } from "@tanstack/react-query"

import { EventCard } from "@/components/event-card"
import { PageHeader } from "@/components/page-header"
import { StatePanel } from "@/components/state-panel"
import { listPastEvents } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"

export function PastEventsPage() {
  const {
    data: events = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: queryKeys.pastEvents,
    queryFn: listPastEvents,
  })

  return (
    <div>
      <PageHeader
        title="Past events"
        description="The ten most recent events that already took place."
      />

      {isPending ? (
        <StatePanel>Loading past events…</StatePanel>
      ) : isError ? (
        <StatePanel tone="error">Failed to load past events.</StatePanel>
      ) : events.length === 0 ? (
        <StatePanel>No past events yet.</StatePanel>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
