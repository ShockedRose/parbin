import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"

import { AppShell } from "@/main-page.tsx"
import { AdminPage } from "@/pages/admin-page"
import { EventDetailsPage } from "@/pages/event-details-page"
import { EventsPage } from "@/pages/events-page"
import { SuggestPage } from "@/pages/suggest-page"

const rootRoute = createRootRoute({
  component: AppShell,
})

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: EventsPage,
})

const eventDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "events/$eventId",
  component: EventDetailsRoute,
})

const suggestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "suggest",
  component: SuggestPage,
})

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "admin",
  component: AdminPage,
})

function EventDetailsRoute() {
  const { eventId } = eventDetailsRoute.useParams()

  return <EventDetailsPage eventId={eventId} />
}

const routeTree = rootRoute.addChildren([
  eventsRoute,
  eventDetailsRoute,
  suggestRoute,
  adminRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
