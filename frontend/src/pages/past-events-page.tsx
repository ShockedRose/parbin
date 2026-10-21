import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Funnel } from "lucide-react"
import { useMemo, useState } from "react"

import { PageHeader } from "@/components/page-header"
import { StatePanel } from "@/components/state-panel"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { listPastEvents } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import type { MeetupEvent } from "@/types/event"

const MAX_VISIBLE_TAGS = 3

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function PastEventRow({ event }: { event: MeetupEvent }) {
  const visibleTags = event.tags.slice(0, MAX_VISIBLE_TAGS)
  const hiddenTagCount = event.tags.length - visibleTags.length

  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="truncate font-serif text-base font-semibold text-foreground group-hover:text-primary">
          {event.title}
        </span>
        {visibleTags.length > 0 ? (
          <span className="flex flex-wrap items-center gap-1.5">
            {visibleTags.map((tag) => (
              <Badge key={tag} variant="tag">
                {tag}
              </Badge>
            ))}
            {hiddenTagCount > 0 ? (
              <Badge
                variant="outline"
                className="text-muted-foreground"
                title={event.tags.slice(MAX_VISIBLE_TAGS).join(", ")}
              >
                +{hiddenTagCount}
              </Badge>
            ) : null}
          </span>
        ) : null}
      </div>

      <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
        {formatShortDate(event.date)}
      </span>
    </Link>
  )
}

export function PastEventsPage() {
  const {
    data: events = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: queryKeys.pastEvents,
    queryFn: listPastEvents,
  })

  const [selectedTag, setSelectedTag] = useState("all")

  const tagOptions = useMemo(
    () => [...new Set(events.flatMap((event) => event.tags))].sort(),
    [events]
  )

  return (
    <div>
      <PageHeader
        title="Past events"
        description="The ten most recent events that already took place."
        actions={
          <div className="flex items-center gap-2">
            <Funnel className="h-4 w-4 text-muted-foreground" aria-hidden />
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger aria-label="Filter past events by tag">
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {tagOptions.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {isPending ? (
        <StatePanel>Loading past events…</StatePanel>
      ) : isError ? (
        <StatePanel tone="error">Failed to load past events.</StatePanel>
      ) : events.length === 0 ? (
        <StatePanel>No past events yet.</StatePanel>
      ) : (
        <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border bg-card">
          {events.map((event) => (
            <PastEventRow key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
