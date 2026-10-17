import type { CatalogTag, ExtractedEvent, ExtractionResult, SuggestionPayload } from "../shared/types"
import { ApiError, checkHealth, fetchCatalogTags, fetchKnownSourceUrls, submitSuggestion } from "./api"
import { ext } from "./browser"
import { loadApiBaseUrl, normalizeApiBaseUrl, saveApiBaseUrl } from "./settings"
import { findCatalogMatch, MAX_EVENT_TAGS, suggestTags } from "./tags"

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id)
  if (!el) throw new Error(`missing #${id}`)
  return el as T
}

const els = {
  siteBadge: byId<HTMLSpanElement>("site-badge"),
  settingsToggle: byId<HTMLButtonElement>("settings-toggle"),
  settings: byId<HTMLElement>("settings"),
  settingsForm: byId<HTMLFormElement>("settings-form"),
  apiBaseUrl: byId<HTMLInputElement>("api-base-url"),
  settingsStatus: byId<HTMLSpanElement>("settings-status"),
  status: byId<HTMLDivElement>("status"),
  form: byId<HTMLFormElement>("event-form"),
  duplicateWarning: byId<HTMLDivElement>("duplicate-warning"),
  imagePreview: byId<HTMLImageElement>("image-preview"),
  title: byId<HTMLInputElement>("title"),
  startsAt: byId<HTMLInputElement>("starts-at"),
  endsAt: byId<HTMLInputElement>("ends-at"),
  timezoneHint: byId<HTMLParagraphElement>("timezone-hint"),
  location: byId<HTMLInputElement>("location"),
  image: byId<HTMLInputElement>("image"),
  description: byId<HTMLTextAreaElement>("description"),
  tagCount: byId<HTMLElement>("tag-count"),
  tagList: byId<HTMLDivElement>("tag-list"),
  tagInput: byId<HTMLInputElement>("tag-input"),
  tagOptions: byId<HTMLDataListElement>("tag-options"),
  tagHint: byId<HTMLParagraphElement>("tag-hint"),
  sourceLink: byId<HTMLAnchorElement>("source-link"),
  formError: byId<HTMLDivElement>("form-error"),
  submit: byId<HTMLButtonElement>("submit"),
}

const state: {
  apiBaseUrl: string
  event: ExtractedEvent | null
  catalog: CatalogTag[]
  tags: string[]
} = { apiBaseUrl: "", event: null, catalog: [], tags: [] }

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

function showStatus(message: string, tone: "info" | "warn" | "error" | "success" = "info"): void {
  els.status.textContent = message
  els.status.className = tone === "info" ? "notice" : `notice notice-${tone}`
  els.status.hidden = false
}

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

/** `datetime-local` works in the browser's zone; the API gets an absolute RFC 3339 value. */
function toLocalInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromLocalInput(value: string): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// ---------- tags ----------

function renderTags(): void {
  els.tagList.replaceChildren(
    ...state.tags.map((name) => {
      const chip = document.createElement("span")
      chip.className = "chip"
      chip.textContent = name
      const remove = document.createElement("button")
      remove.type = "button"
      remove.textContent = "×"
      remove.title = `Remove ${name}`
      remove.addEventListener("click", () => {
        state.tags = state.tags.filter((t) => t !== name)
        renderTags()
      })
      chip.append(remove)
      return chip
    }),
  )

  const selected = new Set(state.tags.map((t) => t.toLowerCase()))
  els.tagOptions.replaceChildren(
    ...state.catalog
      .filter((tag) => !selected.has(tag.name.toLowerCase()))
      .map((tag) => {
        const option = document.createElement("option")
        option.value = tag.name
        return option
      }),
  )
  els.tagCount.textContent = `${state.tags.length}/${MAX_EVENT_TAGS}`
  els.tagInput.disabled = state.tags.length >= MAX_EVENT_TAGS || state.catalog.length === 0
}

function addTagFromInput(): void {
  const raw = els.tagInput.value.trim()
  if (!raw) return
  const match = findCatalogMatch(state.catalog, raw)
  if (!match) {
    els.tagHint.textContent = `"${raw}" is not in the Parbin tag catalog.`
    return
  }
  if (!state.tags.some((t) => t.toLowerCase() === match.name.toLowerCase())) {
    state.tags = [...state.tags, match.name].slice(0, MAX_EVENT_TAGS)
  }
  els.tagInput.value = ""
  els.tagHint.textContent = ""
  renderTags()
}

// ---------- backend data ----------

async function loadBackendData(): Promise<void> {
  const event = state.event
  if (!event) return
  els.tagHint.textContent = "Loading tags…"
  els.duplicateWarning.hidden = true

  const [catalog, known] = await Promise.allSettled([
    fetchCatalogTags(state.apiBaseUrl),
    fetchKnownSourceUrls(state.apiBaseUrl),
  ])

  if (catalog.status === "fulfilled") {
    state.catalog = catalog.value
    state.tags = suggestTags(state.catalog, event.keywords, event.title, event.description)
    els.tagHint.textContent = state.catalog.length === 0 ? "The backend has no tags yet." : ""
  } else {
    state.catalog = []
    state.tags = []
    els.tagHint.textContent = `Couldn't load tags: ${errorMessage(catalog.reason)}`
  }
  renderTags()

  if (known.status === "fulfilled") {
    const url = event.sourceEventPage
    const duplicate = known.value.has(url) || known.value.has(`${url}/`)
    els.duplicateWarning.hidden = !duplicate
    els.submit.textContent = duplicate ? "Send anyway" : "Send suggestion"
  }
}

// ---------- page extraction ----------

async function readActiveTab(): Promise<ExtractionResult> {
  const [tab] = await ext.tabs.query({ active: true, currentWindow: true })
  if (tab?.id === undefined) return { status: "error", message: "No active tab." }
  try {
    const [injection] = await ext.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["extract.js"],
    })
    const result = injection?.result as ExtractionResult | undefined
    return result ?? { status: "error", message: "The page did not return any data." }
  } catch {
    return {
      status: "error",
      message: "This page can't be read. Browser pages and extension stores are off-limits to extensions.",
    }
  }
}

function fillForm(event: ExtractedEvent): void {
  const start = event.startsAt ? new Date(event.startsAt) : null
  const end = event.endsAt
    ? new Date(event.endsAt)
    : start
      ? new Date(start.getTime() + DEFAULT_DURATION_MS)
      : null

  els.title.value = event.title
  els.startsAt.value = start ? toLocalInput(start) : ""
  els.endsAt.value = end ? toLocalInput(end) : ""
  els.timezoneHint.textContent = `Times shown in your time zone (${Intl.DateTimeFormat().resolvedOptions().timeZone}).${event.endsAt ? "" : " End time not on the page; defaulted to 2 hours."}`
  els.location.value = event.location
  els.image.value = event.image
  els.description.value = event.description
  els.sourceLink.href = event.sourceEventPage
  els.sourceLink.textContent = event.sourceEventPage
  updateImagePreview()
}

function updateImagePreview(): void {
  const src = els.image.value.trim()
  els.imagePreview.hidden = !/^https?:\/\//i.test(src)
  if (!els.imagePreview.hidden) els.imagePreview.src = src
}

// ---------- submit ----------

function buildPayload(): SuggestionPayload {
  const event = state.event
  if (!event) throw new Error("No event loaded.")
  const title = els.title.value.trim()
  if (!title) throw new Error("Title is required.")
  const start = fromLocalInput(els.startsAt.value)
  const end = fromLocalInput(els.endsAt.value)
  if (!start || !end) throw new Error("Start and end times are required.")
  if (end < start) throw new Error("The end time must be after the start time.")

  return {
    title,
    description: els.description.value.trim(),
    date: start.toISOString(),
    endDate: end.toISOString(),
    location: els.location.value.trim(),
    image: els.image.value.trim(),
    tags: state.tags,
    sourceEventPage: event.sourceEventPage,
  }
}

async function onSubmit(e: SubmitEvent): Promise<void> {
  e.preventDefault()
  els.formError.hidden = true
  let payload: SuggestionPayload
  try {
    payload = buildPayload()
  } catch (err) {
    els.formError.textContent = errorMessage(err)
    els.formError.hidden = false
    return
  }

  els.submit.disabled = true
  els.submit.textContent = "Sending…"
  try {
    await submitSuggestion(state.apiBaseUrl, payload)
    els.form.hidden = true
    showStatus("Suggestion sent. A Parbin admin will review it soon.", "success")
  } catch (err) {
    els.formError.textContent = err instanceof ApiError ? err.message : `Unexpected error: ${errorMessage(err)}`
    els.formError.hidden = false
    els.submit.textContent = "Send suggestion"
  } finally {
    els.submit.disabled = false
  }
}

// ---------- settings ----------

function toggleSettings(open = els.settings.hidden): void {
  els.settings.hidden = !open
  els.settingsToggle.setAttribute("aria-expanded", String(open))
  if (open) els.apiBaseUrl.focus()
}

function setSettingsStatus(message: string, tone: "ok" | "error" | "" = ""): void {
  els.settingsStatus.textContent = message
  els.settingsStatus.className = tone ? `hint ${tone}` : "hint"
}

async function onSaveSettings(e: SubmitEvent): Promise<void> {
  e.preventDefault()
  let baseUrl: string
  try {
    baseUrl = normalizeApiBaseUrl(els.apiBaseUrl.value)
  } catch (err) {
    setSettingsStatus(errorMessage(err), "error")
    return
  }

  els.apiBaseUrl.value = baseUrl
  await saveApiBaseUrl(baseUrl)
  state.apiBaseUrl = baseUrl
  setSettingsStatus("Testing…")
  try {
    await checkHealth(baseUrl)
    setSettingsStatus("Saved. Backend reachable.", "ok")
  } catch (err) {
    setSettingsStatus(`Saved, but ${errorMessage(err)}`, "error")
  }
  await loadBackendData()
}

// ---------- init ----------

async function init(): Promise<void> {
  els.settingsToggle.addEventListener("click", () => toggleSettings())
  els.settingsForm.addEventListener("submit", (e) => void onSaveSettings(e))
  els.form.addEventListener("submit", (e) => void onSubmit(e))
  els.image.addEventListener("input", updateImagePreview)
  els.imagePreview.addEventListener("error", () => (els.imagePreview.hidden = true))
  els.tagInput.addEventListener("change", addTagFromInput)
  els.tagInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTagFromInput()
    }
  })

  state.apiBaseUrl = await loadApiBaseUrl()
  els.apiBaseUrl.value = state.apiBaseUrl

  const result = await readActiveTab()
  switch (result.status) {
    case "unsupported":
      showStatus(`${result.hostname} isn't a supported events site yet. Supported: Meetup, GDG, CNCF.`, "warn")
      return
    case "not-event":
      els.siteBadge.textContent = result.strategy.label
      els.siteBadge.hidden = false
      showStatus(result.message, "warn")
      return
    case "error":
      showStatus(result.message, "error")
      return
    case "ok":
      break
  }

  els.siteBadge.textContent = result.strategy.label
  els.siteBadge.hidden = false
  state.event = result.event
  fillForm(result.event)
  els.status.hidden = true
  els.form.hidden = false
  if (!result.event.startsAt) {
    els.formError.textContent = "Couldn't find the event date on the page. Please fill it in."
    els.formError.hidden = false
  }
  renderTags()
  await loadBackendData()
}

void init().catch((err) => showStatus(`Something went wrong: ${errorMessage(err)}`, "error"))
