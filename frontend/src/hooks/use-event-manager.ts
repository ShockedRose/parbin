import { useCallback, useEffect, useState } from "react"

import {
  approveSuggestion as approveSuggestionRequest,
  createEvent as createEventRequest,
  createSuggestion as createSuggestionRequest,
  updateEvent as updateEventRequest,
  getCurrentAdmin,
  isApiError,
  listEvents,
  listSuggestions as listSuggestionsRequest,
  login as loginRequest,
  logout as logoutRequest,
  rejectSuggestion as rejectSuggestionRequest,
} from "@/lib/api"
import type {
  AdminSession,
  EventPayload,
  EventSuggestion,
  MeetupEvent,
} from "@/types/event"

interface EventFormState {
  title: string
  description: string
  date: string
  endDate: string
  location: string
  image: string
  tags: string
}

interface LoginFormState {
  email: string
  password: string
}

const emptyEventForm: EventFormState = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  location: "",
  image: "",
  tags: "",
}

const emptyLoginForm: LoginFormState = {
  email: "",
  password: "",
}

const fallbackImage =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop"

function toPayload(form: EventFormState): EventPayload {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    date: form.date,
    endDate: form.endDate,
    location: form.location.trim(),
    image: form.image.trim() || fallbackImage,
    tags: form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong."
}

export function useEventManager() {
  const [events, setEvents] = useState<MeetupEvent[]>([])
  const [suggestions, setSuggestions] = useState<EventSuggestion[]>([])
  const [admin, setAdmin] = useState<AdminSession | null>(null)
  const [eventForm, setEventForm] = useState<EventFormState>(emptyEventForm)
  const [suggestionForm, setSuggestionForm] =
    useState<EventFormState>(emptyEventForm)
  const [loginForm, setLoginForm] = useState<LoginFormState>(emptyLoginForm)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isEventsLoading, setIsEventsLoading] = useState(false)
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const eventImagePreview = eventForm.image.trim() || null
  const suggestionImagePreview = suggestionForm.image.trim() || null

  const loadEvents = useCallback(async () => {
    setIsEventsLoading(true)

    try {
      const nextEvents = await listEvents()
      setEvents(nextEvents)
      setError(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsEventsLoading(false)
    }
  }, [])

  const loadSuggestions = useCallback(async () => {
    if (!admin) {
      setSuggestions([])
      return
    }

    setIsSuggestionsLoading(true)

    try {
      const nextSuggestions = await listSuggestionsRequest()
      setSuggestions(nextSuggestions)
      setError(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSuggestionsLoading(false)
    }
  }, [admin])

  const restoreSession = useCallback(async () => {
    try {
      const currentAdmin = await getCurrentAdmin()
      setAdmin(currentAdmin)
      setError(null)
      return currentAdmin
    } catch (err) {
      if (isApiError(err, 401)) {
        setAdmin(null)
        setSuggestions([])
        return null
      }

      setError(getErrorMessage(err))
      return null
    }
  }, [])

  useEffect(() => {
    let active = true

    const bootstrap = async () => {
      setIsBootstrapping(true)

      try {
        await loadEvents()
        const currentAdmin = await restoreSession()
        if (active && currentAdmin) {
          const nextSuggestions = await listSuggestionsRequest()
          if (active) {
            setSuggestions(nextSuggestions)
          }
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err))
        }
      } finally {
        if (active) {
          setIsBootstrapping(false)
        }
      }
    }

    void bootstrap()

    return () => {
      active = false
    }
  }, [loadEvents, restoreSession])

  const updateEventField = (field: keyof EventFormState, value: string) => {
    setEventForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateSuggestionField = (
    field: keyof EventFormState,
    value: string
  ) => {
    setSuggestionForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateLoginField = (field: keyof LoginFormState, value: string) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }))
  }

  const addEvent = async () => {
    setIsSubmitting(true)

    try {
      await createEventRequest(toPayload(eventForm))
      setEventForm(emptyEventForm)
      setNotice("Event deployed.")
      setError(null)
      await loadEvents()
      await loadSuggestions()
      return true
    } catch (err) {
      setError(getErrorMessage(err))
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitSuggestion = async () => {
    setIsSubmitting(true)

    try {
      await createSuggestionRequest(toPayload(suggestionForm))
      setSuggestionForm(emptyEventForm)
      setNotice("Suggestion submitted for review.")
      setError(null)
      return true
    } catch (err) {
      setError(getErrorMessage(err))
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const login = async () => {
    setIsAuthenticating(true)

    try {
      const nextAdmin = await loginRequest(loginForm.email, loginForm.password)
      setAdmin(nextAdmin)
      setLoginForm(emptyLoginForm)
      setNotice("Admin session active.")
      setError(null)
      const nextSuggestions = await listSuggestionsRequest()
      setSuggestions(nextSuggestions)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsAuthenticating(false)
    }
  }

  const logout = async () => {
    setIsAuthenticating(true)

    try {
      await logoutRequest()
      setAdmin(null)
      setSuggestions([])
      setNotice("Session closed.")
      setError(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsAuthenticating(false)
    }
  }

  const approveSuggestion = async (id: string) => {
    setActiveSuggestionId(id)

    try {
      await approveSuggestionRequest(id)
      setNotice("Suggestion converted into an event.")
      setError(null)
      await loadEvents()
      await loadSuggestions()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActiveSuggestionId(null)
    }
  }

  const rejectSuggestion = async (id: string) => {
    setActiveSuggestionId(id)

    try {
      await rejectSuggestionRequest(id)
      setNotice("Suggestion rejected.")
      setError(null)
      await loadSuggestions()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActiveSuggestionId(null)
    }
  }

  const editEvent = async (id: string, payload: EventPayload) => {
    setIsSubmitting(true)

    try {
      await updateEventRequest(id, payload)
      setNotice("Event updated.")
      setError(null)
      await loadEvents()
      return true
    } catch (err) {
      setError(getErrorMessage(err))
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    admin,
    events,
    suggestions,
    eventForm,
    suggestionForm,
    loginForm,
    eventImagePreview,
    suggestionImagePreview,
    error,
    notice,
    setError,
    setNotice,
    isBootstrapping,
    isEventsLoading,
    isSuggestionsLoading,
    isSubmitting,
    isAuthenticating,
    activeSuggestionId,
    updateEventField,
    updateSuggestionField,
    updateLoginField,
    addEvent,
    editEvent,
    submitSuggestion,
    login,
    logout,
    approveSuggestion,
    rejectSuggestion,
  }
}
