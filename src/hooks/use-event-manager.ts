import { useState, type ChangeEvent } from "react"
import type { MeetupEvent } from "@/types/event"
import { mockEvents } from "@/data/events"

interface NewEventForm {
  title: string
  description: string
  date: string
  endDate: string
  location: string
  tags: string
}

const emptyForm: NewEventForm = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  location: "",
  tags: "",
}

export function useEventManager() {
  const [events, setEvents] = useState<MeetupEvent[]>(mockEvents)
  const [view, setView] = useState<"events" | "admin">("events")
  const [form, setForm] = useState<NewEventForm>(emptyForm)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const updateField = (field: keyof NewEventForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const addEvent = () => {
    if (!form.title || !form.date || !form.endDate) return

    const newEvent: MeetupEvent = {
      id: `evt-${Date.now()}`,
      title: form.title,
      description: form.description,
      date: form.date,
      endDate: form.endDate,
      location: form.location,
      image:
        imagePreview ||
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }

    setEvents((prev) => [newEvent, ...prev])
    setForm(emptyForm)
    setImagePreview(null)
    setView("events")
  }

  return {
    events,
    view,
    setView,
    form,
    updateField,
    imagePreview,
    handleImageChange,
    addEvent,
  }
}
