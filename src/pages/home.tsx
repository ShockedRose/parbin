import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

const designs = [
  {
    id: 1,
    name: "BRUTALIST",
    subtitle: "Raw · Stark · Unapologetic",
    description:
      "Stripped-down aesthetics with bold monospace typography, neon accents on black, and zero-radius edges. The anti-design design.",
    bg: "#0a0a0a",
    fg: "#e8e8e8",
    accent: "#b5ff00",
    font: "'Space Mono', monospace",
  },
  {
    id: 2,
    name: "Organic",
    subtitle: "Warm · Earthy · Inviting",
    description:
      "Terracotta and sage on cream, flowing serif typography, soft shadows, and generous curves. Feels like a craft coffee meetup.",
    bg: "#faf8f4",
    fg: "#2d2418",
    accent: "#c4572a",
    font: "'Lora', serif",
  },
  {
    id: 3,
    name: "NEXUS",
    subtitle: "Neon · Dark · Futuristic",
    description:
      "Cyan and magenta neons on deep navy, glowing borders, monospace readouts. A cyberpunk terminal for the future of tech.",
    bg: "#050a18",
    fg: "#e0e8ff",
    accent: "#00f0ff",
    font: "'Orbitron', sans-serif",
  },
  {
    id: 4,
    name: "Editorial",
    subtitle: "Clean · Sophisticated · Refined",
    description:
      "Magazine-inspired layout with elegant serifs, gold accents on ivory, and typographic hierarchy that commands attention.",
    bg: "#f9f7f3",
    fg: "#1a1a2e",
    accent: "#c9a84c",
    font: "'Playfair Display', serif",
  },
  {
    id: 5,
    name: "Bubbly",
    subtitle: "Colorful · Fun · Friendly",
    description:
      "Coral and teal pops, extra-rounded corners, playful typography, and bouncy interactions. Makes tech feel approachable.",
    bg: "#fffef5",
    fg: "#2d2250",
    accent: "#ff6b6b",
    font: "'Fredoka', sans-serif",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden border-b px-6 py-24 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Design Explorations
        </p>
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          TechMeetups
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
          Five distinct design directions for a technology meetup events
          platform. Each with its own personality, color theme, and aesthetic
          voice.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {designs.map((d, i) => (
            <Link
              key={d.id}
              to={`/${d.id}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                animationDelay: `${i * 80}ms`,
                animation: "fadeInUp 0.5s ease both",
              }}
            >
              <div
                className="flex h-40 items-end p-5"
                style={{
                  background: d.bg,
                  color: d.fg,
                  fontFamily: d.font,
                }}
              >
                <div>
                  <div
                    className="mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: d.accent,
                      color: d.bg,
                    }}
                  >
                    Design {d.id}
                  </div>
                  <h2 className="text-2xl font-bold leading-tight">{d.name}</h2>
                  <p className="text-xs opacity-70">{d.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {d.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary transition-colors group-hover:text-foreground">
                  Explore design
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              <div className="flex gap-0 border-t">
                {[d.bg, d.fg, d.accent].map((color, j) => (
                  <div
                    key={j}
                    className="h-2 flex-1"
                    style={{ background: color }}
                  />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </main>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
