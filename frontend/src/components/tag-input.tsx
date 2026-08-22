import { useQuery } from "@tanstack/react-query"
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { listTags } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import {
  MAX_EVENT_TAGS,
  canCreateTag,
  filterTagSuggestions,
  findCatalogMatch,
  isTagSelected,
  normalizeTagName,
} from "@/lib/tags"
import { cn } from "@/lib/utils"

type SuggestionOption =
  | { type: "catalog"; name: string }
  | { type: "create"; name: string }

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  allowCreate?: boolean
  disabled?: boolean
}

export function TagInput({
  value,
  onChange,
  allowCreate = false,
  disabled = false,
}: TagInputProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const tagsQuery = useQuery({
    queryKey: queryKeys.tags,
    queryFn: listTags,
  })

  const catalog = useMemo(() => tagsQuery.data ?? [], [tagsQuery.data])
  const atLimit = value.length >= MAX_EVENT_TAGS
  const suggestions = useMemo(
    () => filterTagSuggestions(catalog, value, query),
    [catalog, query, value]
  )
  const createName = normalizeTagName(query)
  const showCreate =
    allowCreate && canCreateTag(catalog, value, query) && createName !== ""

  const options = useMemo<SuggestionOption[]>(() => {
    const next: SuggestionOption[] = suggestions.map((tag) => ({
      type: "catalog",
      name: tag.name,
    }))
    if (showCreate) {
      next.push({ type: "create", name: createName })
    }
    return next
  }, [createName, showCreate, suggestions])
  const resolvedIndex =
    options.length === 0 ? 0 : Math.min(activeIndex, options.length - 1)

  useEffect(() => {
    if (!open) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return
      }
      setOpen(false)
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  const addTag = (name: string) => {
    const catalogMatch = findCatalogMatch(catalog, name)
    const nextName = catalogMatch?.name ?? normalizeTagName(name)
    if (!nextName || atLimit || isTagSelected(value, nextName)) {
      return
    }
    if (!catalogMatch && !allowCreate) {
      return
    }

    onChange([...value, nextName])
    setQuery("")
    setActiveIndex(0)
    inputRef.current?.focus()
  }

  const removeTag = (name: string) => {
    onChange(value.filter((tag) => tag !== name))
    inputRef.current?.focus()
  }

  const commitQuery = () => {
    if (options[resolvedIndex]) {
      addTag(options[resolvedIndex].name)
      return
    }

    const match = findCatalogMatch(catalog, query)
    if (match) {
      addTag(match.name)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && query === "" && value.length > 0) {
      event.preventDefault()
      removeTag(value[value.length - 1])
      return
    }

    if (event.key === "Escape") {
      setOpen(false)
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(
        options.length === 0 ? 0 : (resolvedIndex + 1) % options.length
      )
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(
        options.length === 0
          ? 0
          : (resolvedIndex - 1 + options.length) % options.length
      )
      return
    }

    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      commitQuery()
    }
  }

  const showMenu = open && !atLimit && !disabled && options.length > 0

  return (
    <div ref={rootRef} className="space-y-1.5">
      <div
        className={cn(
          "flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1 transition-colors",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          disabled && "pointer-events-none opacity-50"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="node"
            className="h-6 gap-1 pr-1 text-[10px] font-medium tracking-wide uppercase"
          >
            {tag}
            <button
              type="button"
              className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation()
                removeTag(tag)
              }}
              aria-label={`Remove ${tag}`}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={query}
          disabled={disabled || atLimit}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            value.length === 0
              ? allowCreate
                ? ">> Search or create a tag"
                : ">> Search existing tags"
              : atLimit
                ? ""
                : ">> Add tag"
          }
          className="min-w-[8rem] flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showMenu}
          aria-controls={listId}
          aria-activedescendant={
            showMenu && options[resolvedIndex]
              ? `${listId}-${resolvedIndex}`
              : undefined
          }
        />
      </div>

      {showMenu ? (
        <ul
          id={listId}
          role="listbox"
          className="z-50 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-sm shadow-md"
        >
          {options.map((option, index) => (
            <li
              id={`${listId}-${index}`}
              key={`${option.type}-${option.name}`}
              role="option"
              aria-selected={index === resolvedIndex}
              className={cn(
                "cursor-pointer rounded-md px-2 py-1.5 text-[11px] tracking-wide uppercase",
                index === resolvedIndex
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onMouseDown={(event) => {
                event.preventDefault()
                addTag(option.name)
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {option.type === "create"
                ? `Create "${option.name}"`
                : option.name}
            </li>
          ))}
        </ul>
      ) : open && !atLimit && !disabled && normalizeTagName(query) !== "" ? (
        <div className="rounded-lg border border-border bg-popover px-2 py-1.5 text-[11px] text-muted-foreground">
          No matching tags.
        </div>
      ) : null}

      <p className="text-[10px] text-muted-foreground">
        {allowCreate
          ? `Select up to ${MAX_EVENT_TAGS} tags. New names are created when you save.`
          : `Select up to ${MAX_EVENT_TAGS} tags from the catalog.`}
        {atLimit ? " Limit reached." : ""}
      </p>
    </div>
  )
}
