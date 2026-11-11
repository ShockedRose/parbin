import { cn } from "@/lib/utils"

/**
 * Parbin brand mark: a person at a laptop shouting "¡Qué Xopa!" — a nod to
 * Panamanian meetup culture. Drawn in the accent rose with a steel laptop so
 * it sits straight on the page background, no badge/square behind it.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 82 46"
      aria-hidden
      className={cn("fill-accent", className)}
    >
      {/* Speech bubble with a tail pointing at the shout */}
      <path d="M28 2 H73 A6 6 0 0 1 79 8 V17 A6 6 0 0 1 73 23 H41 L33.8 29.6 C32.8 30.5 31.4 29.8 31.4 28.6 V23 H28 A6 6 0 0 1 22 17 V8 A6 6 0 0 1 28 2 Z" />
      <text
        x="50.5"
        y="16.6"
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="12"
        fontWeight="700"
        textLength="45"
        lengthAdjust="spacingAndGlyphs"
        className="fill-card"
      >
        ¡Qué Xopa!
      </text>

      {/* Person: head, mouth, shoulders */}
      <circle cx="16" cy="25.5" r="5.9" />
      <circle cx="18.8" cy="23.6" r="1.35" className="fill-background" />
      <path d="M6.5 44.5C6.5 38 11 33.6 16 33.6s9.5 4.4 9.5 10.9Z" />

      {/* Laptop: screen, screen face, keyboard, hand, raised shouting arm */}
      <rect
        x="10.6"
        y="29.9"
        width="11.8"
        height="8.7"
        rx="1.4"
        className="fill-muted-foreground"
      />
      <rect
        x="12"
        y="31.3"
        width="9"
        height="5.9"
        rx="0.7"
        className="fill-background"
      />
      <rect
        x="7"
        y="38.5"
        width="19"
        height="3"
        rx="1.5"
        className="fill-muted-foreground"
      />
      <circle cx="9.4" cy="37.6" r="1.6" />
      <path
        d="M22 34.5 25.6 27.6"
        className="stroke-accent"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="26.4" cy="25.8" r="2.2" />
    </svg>
  )
}
