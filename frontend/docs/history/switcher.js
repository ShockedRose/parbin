(() => {
  if (window.self !== window.top) return

  const pages = [
    { file: "01-bulletin.html", name: "Community Bulletin" },
    { file: "02-rose-season.html", name: "Rose Season" },
    { file: "03-blue-hour.html", name: "Blue Hour" },
    { file: "04-calm-calendar.html", name: "Calm Calendar" },
    { file: "05-night-guide.html", name: "Night Guide" },
  ]
  const current = decodeURIComponent(location.pathname.split("/").pop())
  const index = pages.findIndex((page) => page.file === current)
  if (index === -1) return

  const prev = pages[(index - 1 + pages.length) % pages.length]
  const next = pages[(index + 1) % pages.length]
  const number = String(index + 1).padStart(2, "0")

  const host = document.createElement("div")
  const root = host.attachShadow({ mode: "open" })
  root.innerHTML = `
    <style>
      :host { all: initial; }
      .bar {
        position: fixed; left: 50%; bottom: 18px; z-index: 9999;
        transform: translateX(-50%);
        display: flex; align-items: center; gap: 4px; padding: 5px;
        font: 500 12px/1 system-ui, -apple-system, "Segoe UI", sans-serif;
        color: #f1f5fb; background: rgba(10, 14, 20, 0.86);
        border: 1px solid #243044; border-radius: 999px;
        backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        opacity: 0.55; transition: opacity 0.2s ease;
      }
      .bar:hover, .bar:focus-within { opacity: 1; }
      a {
        color: inherit; text-decoration: none; padding: 8px 12px;
        border-radius: 999px; transition: background 0.2s ease, color 0.2s ease;
      }
      a:hover { background: #161f2e; color: #0095ff; }
      .label { padding: 0 10px; white-space: nowrap; color: #8ba3c0; }
      .label b { color: #0095ff; font-weight: 700; margin-right: 6px; }
    </style>
    <nav class="bar" aria-label="Design candidates">
      <a href="index.html" title="All candidates">⌂</a>
      <a href="${prev.file}" title="Previous: ${prev.name}">←</a>
      <span class="label"><b>${number}</b>${pages[index].name}</span>
      <a href="${next.file}" title="Next: ${next.name}">→</a>
    </nav>
  `
  document.body.appendChild(host)

  document.addEventListener("keydown", (event) => {
    if (event.target.closest?.("input, textarea, select")) return
    if (event.key === "ArrowLeft") location.href = prev.file
    if (event.key === "ArrowRight") location.href = next.file
    if (event.key === "Escape") location.href = "index.html"
  })
})()
