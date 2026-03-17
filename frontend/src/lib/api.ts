import type {
  AdminSession,
  EventPayload,
  EventSuggestion,
  MeetupEvent,
} from "@/types/event"

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080"

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const isJSON = response.headers
    .get("content-type")
    ?.includes("application/json")
  const payload = isJSON
    ? ((await response.json()) as T | { error?: string })
    : null

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? payload.error || `Request failed with ${response.status}`
        : `Request failed with ${response.status}`
    throw new ApiError(message, response.status)
  }

  return payload as T
}

export function isApiError(error: unknown, status?: number): error is ApiError {
  if (!(error instanceof ApiError)) {
    return false
  }

  return status === undefined ? true : error.status === status
}

export async function listEvents(): Promise<MeetupEvent[]> {
  const response = await request<{ events: MeetupEvent[] }>("/api/events")
  return response.events
}

export async function createEvent(payload: EventPayload): Promise<MeetupEvent> {
  const response = await request<{ event: MeetupEvent }>("/api/events", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return response.event
}

export async function updateEvent(
  id: string,
  payload: EventPayload
): Promise<MeetupEvent> {
  const response = await request<{ event: MeetupEvent }>(`/api/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  return response.event
}

export async function createSuggestion(
  payload: EventPayload
): Promise<EventSuggestion> {
  const response = await request<{ suggestion: EventSuggestion }>(
    "/api/event-suggestions",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
  return response.suggestion
}

export async function login(
  email: string,
  password: string
): Promise<AdminSession> {
  const response = await request<{ admin: AdminSession }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  return response.admin
}

export async function logout(): Promise<void> {
  await request<void>("/api/auth/logout", {
    method: "POST",
  })
}

export async function getCurrentAdmin(): Promise<AdminSession> {
  const response = await request<{ admin: AdminSession }>("/api/auth/me")
  return response.admin
}

export async function listSuggestions(): Promise<EventSuggestion[]> {
  const response = await request<{ suggestions: EventSuggestion[] }>(
    "/api/admin/event-suggestions"
  )
  return response.suggestions
}

export async function approveSuggestion(id: string): Promise<EventSuggestion> {
  const response = await request<{ suggestion: EventSuggestion }>(
    `/api/admin/event-suggestions/${id}/approve`,
    { method: "POST" }
  )
  return response.suggestion
}

export async function rejectSuggestion(id: string): Promise<EventSuggestion> {
  const response = await request<{ suggestion: EventSuggestion }>(
    `/api/admin/event-suggestions/${id}/reject`,
    { method: "POST" }
  )
  return response.suggestion
}
