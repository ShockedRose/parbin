import { createContext, useContext } from "react"

import { useEventManager } from "@/hooks/use-event-manager"

type EventManagerState = ReturnType<typeof useEventManager>

export const EventManagerContext = createContext<EventManagerState | null>(null)

export function useEventManagerContext() {
  const context = useContext(EventManagerContext)

  if (!context) {
    throw new Error("Event manager context is unavailable.")
  }

  return context
}
