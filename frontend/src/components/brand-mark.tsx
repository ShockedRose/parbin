import { cn } from "@/lib/utils"

/**
 * Parbin brand mark: the featured blue meetup pin tucked behind a person at a
 * laptop shouting "¡Qué Xopa!" — a nod to Panamanian meetup culture. Drawn
 * straight on the page background, no badge/square behind it. The laptop uses
 * a blue ramp — mid bezel, dark display, darker front edge — for depth.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="3 0 89 46"
      aria-hidden
      className={cn("fill-accent", className)}
    >
      {/* Featured pin behind the person, tilted and ~20% smaller, hole punched out */}
      <g transform="translate(1.6 18.5) rotate(-15 12 11.8) scale(0.96)">
        <path
          d="M12 21.7c-.33 0-.65-.13-.9-.37C8.6 18.9 3 13.4 3 10.3 3 5.5 7 1.9 12 1.9s9 3.6 9 8.4c0 3.1-5.6 8.6-8.1 11.03-.25.24-.57.37-.9.37ZM12 7.3a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 1 0 0-5.4Z"
          fillRule="evenodd"
          className="fill-primary"
        />
      </g>

      <g transform="translate(11 0)">
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

        {/* Laptop in blue tones: screen, display, body, front edge */}
        <rect
          x="10.6"
          y="29.9"
          width="11.8"
          height="8.7"
          rx="1.4"
          fill="color-mix(in srgb, var(--primary) 74%, #001220)"
        />
        <rect
          x="12"
          y="31.3"
          width="9"
          height="5.9"
          rx="0.7"
          fill="color-mix(in srgb, var(--primary) 10%, #001220)"
        />
        <rect
          x="7"
          y="38.4"
          width="19"
          height="1.8"
          rx="0.9"
          fill="color-mix(in srgb, var(--primary) 74%, #001220)"
        />
        <rect
          x="7"
          y="39.9"
          width="19"
          height="1.6"
          rx="0.8"
          fill="color-mix(in srgb, var(--primary) 44%, #001220)"
        />
        <rect
          x="8.2"
          y="41"
          width="16.6"
          height="0.9"
          rx="0.45"
          fill="color-mix(in srgb, var(--primary) 26%, #001220)"
        />

        {/* Hands on the keyboard */}
        <circle cx="9.4" cy="37.5" r="1.6" />
        <circle cx="23.6" cy="37.5" r="1.6" />
      </g>
    </svg>
  )
}
