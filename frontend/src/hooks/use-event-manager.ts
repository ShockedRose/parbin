import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react"

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
import { queryKeys } from "@/lib/query-keys"
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

async function fetchSession(): Promise<AdminSession | null> {
  try {
    return await getCurrentAdmin()
  } catch (err) {
    if (isApiError(err, 401)) {
      return null
    }
    throw err
  }
}

export function useEventManager() {
  const queryClient = useQueryClient()
  const [eventForm, setEventForm] = useState<EventFormState>(emptyEventForm)
  const [suggestionForm, setSuggestionForm] =
    useState<EventFormState>(emptyEventForm)
  const [loginForm, setLoginForm] = useState<LoginFormState>(emptyLoginForm)
  const [notice, setNotice] = useState<string | null>(null)

  const eventsQuery = useQuery({
    queryKey: queryKeys.events,
    queryFn: listEvents,
  })

  const sessionQuery = useQuery({
    queryKey: queryKeys.session,
    queryFn: fetchSession,
  })

  const admin = sessionQuery.data ?? null

  const suggestionsQuery = useQuery({
    queryKey: queryKeys.suggestions,
    queryFn: listSuggestionsRequest,
    enabled: sessionQuery.isSuccess && admin !== null,
  })

  const isBootstrapping =
    eventsQuery.isPending ||
    sessionQuery.isPending ||
    (sessionQuery.isSuccess && admin !== null && suggestionsQuery.isPending)

  const events: MeetupEvent[] = eventsQuery.data ?? []
  const suggestions: EventSuggestion[] = suggestionsQuery.data ?? []

  const createEventMutation = useMutation({
    mutationFn: () => createEventRequest(toPayload(eventForm)),
    onSuccess: () => {
      setEventForm(emptyEventForm)
      setNotice("Event deployed.")
      void queryClient.invalidateQueries({ queryKey: queryKeys.events })
      void queryClient.invalidateQueries({ queryKey: queryKeys.suggestions })
    },
  })

  const createSuggestionMutation = useMutation({
    mutationFn: () => createSuggestionRequest(toPayload(suggestionForm)),
    onSuccess: () => {
      setSuggestionForm(emptyEventForm)
      setNotice("Suggestion submitted for review.")
    },
  })

  const loginMutation = useMutation({
    mutationFn: () => loginRequest(loginForm.email, loginForm.password),
    onSuccess: (nextAdmin) => {
      setLoginForm(emptyLoginForm)
      setNotice("Admin session active.")
      queryClient.setQueryData(queryKeys.session, nextAdmin)
      void queryClient.invalidateQueries({ queryKey: queryKeys.suggestions })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      setNotice("Session closed.")
      queryClient.setQueryData(queryKeys.session, null)
      queryClient.removeQueries({ queryKey: queryKeys.suggestions })
    },
  })

  const approveSuggestionMutation = useMutation({
    mutationFn: approveSuggestionRequest,
    onSuccess: () => {
      setNotice("Suggestion converted into an event.")
      void queryClient.invalidateQueries({ queryKey: queryKeys.events })
      void queryClient.invalidateQueries({ queryKey: queryKeys.suggestions })
    },
  })

  const rejectSuggestionMutation = useMutation({
    mutationFn: rejectSuggestionRequest,
    onSuccess: () => {
      setNotice("Suggestion rejected.")
      void queryClient.invalidateQueries({ queryKey: queryKeys.suggestions })
    },
  })

  const updateEventMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: EventPayload
    }) => updateEventRequest(id, payload),
    onSuccess: (_data, { id }) => {
      setNotice("Event updated.")
      void queryClient.invalidateQueries({ queryKey: queryKeys.events })
      void queryClient.invalidateQueries({ queryKey: queryKeys.event(id) })
    },
  })

  const queryErrorMessage = useMemo(() => {
    for (const q of [eventsQuery, sessionQuery, suggestionsQuery]) {
      if (q.error) {
        return getErrorMessage(q.error)
      }
    }
    return null
  }, [eventsQuery.error, sessionQuery.error, suggestionsQuery.error])

  const mutationErrorMessage = useMemo(() => {
    for (const m of [
      createEventMutation,
      createSuggestionMutation,
      loginMutation,
      logoutMutation,
      approveSuggestionMutation,
      rejectSuggestionMutation,
      updateEventMutation,
    ]) {
      if (m.error) {
        return getErrorMessage(m.error)
      }
    }
    return null
  }, [
    createEventMutation.error,
    createSuggestionMutation.error,
    loginMutation.error,
    logoutMutation.error,
    approveSuggestionMutation.error,
    rejectSuggestionMutation.error,
    updateEventMutation.error,
  ])

  const error = mutationErrorMessage ?? queryErrorMessage

  const resetMutationErrors = useCallback(() => {
    createEventMutation.reset()
    createSuggestionMutation.reset()
    loginMutation.reset()
    logoutMutation.reset()
    approveSuggestionMutation.reset()
    rejectSuggestionMutation.reset()
    updateEventMutation.reset()
  }, [
    createEventMutation,
    createSuggestionMutation,
    loginMutation,
    logoutMutation,
    approveSuggestionMutation,
    rejectSuggestionMutation,
    updateEventMutation,
  ])

  const setError = useCallback<Dispatch<SetStateAction<string | null>>>(
    (value) => {
      const next = typeof value === "function" ? value(error) : value
      if (next !== null) {
        return
      }
      resetMutationErrors()
    },
    [error, resetMutationErrors]
  )

  const eventImagePreview = eventForm.image.trim() || null
  const suggestionImagePreview = suggestionForm.image.trim() || null

  const isSubmitting =
    createEventMutation.isPending ||
    createSuggestionMutation.isPending ||
    updateEventMutation.isPending

  const isAuthenticating =
    loginMutation.isPending || logoutMutation.isPending

  const activeSuggestionId =
    approveSuggestionMutation.isPending &&
    approveSuggestionMutation.variables != null
      ? approveSuggestionMutation.variables
      : rejectSuggestionMutation.isPending &&
          rejectSuggestionMutation.variables != null
        ? rejectSuggestionMutation.variables
        : null

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
    try {
      await createEventMutation.mutateAsync()
      return true
    } catch {
      return false
    }
  }

  const submitSuggestion = async () => {
    try {
      await createSuggestionMutation.mutateAsync()
      return true
    } catch {
      return false
    }
  }

  const login = async () => {
    try {
      await loginMutation.mutateAsync()
    } catch {
      /* surfaced via mutation error */
    }
  }

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      /* surfaced via mutation error */
    }
  }

  const approveSuggestion = async (id: string) => {
    try {
      await approveSuggestionMutation.mutateAsync(id)
    } catch {
      /* surfaced via mutation error */
    }
  }

  const rejectSuggestion = async (id: string) => {
    try {
      await rejectSuggestionMutation.mutateAsync(id)
    } catch {
      /* surfaced via mutation error */
    }
  }

  const editEvent = async (id: string, payload: EventPayload) => {
    try {
      await updateEventMutation.mutateAsync({ id, payload })
      return true
    } catch {
      return false
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
    isEventsLoading:
      eventsQuery.isFetching && eventsQuery.data === undefined,
    isSuggestionsLoading: suggestionsQuery.isFetching,
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
