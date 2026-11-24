import { expect, test } from "@playwright/test"

const admin = {
  id: "adm_e2e",
  email: "admin@parbin.local",
  createdAt: "2026-01-01T12:00:00Z",
}

const suggestion = {
  id: "sug_e2e",
  title: "GDG Panamá: Cloud Run en producción",
  description:
    "Una noche para compartir cómo llevamos cargas de trabajo reales a Cloud Run.",
  date: "2026-12-10T18:30:00-05:00",
  endDate: "2026-12-10T21:00:00-05:00",
  location: "Ciudad del Saber, Panamá",
  image:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
  tags: ["Cloud", "DevOps"],
  sourceEventPage: "https://gdg.community.dev/events/details/cloud-run/",
  status: "pending",
  sourceEventId: null,
  createdAt: "2026-11-20T15:10:00Z",
  reviewedAt: null,
  reviewedBy: null,
}

test.describe("Admin suggestion preview", () => {
  test("previews a suggestion as an event and approves it from the dialog", async ({
    page,
  }) => {
    await page.route("**/api/**", async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      const cors = {
        "access-control-allow-origin":
          request.headers()["origin"] ?? "http://localhost:5199",
        "access-control-allow-credentials": "true",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "content-type",
      }

      if (request.method() === "OPTIONS") {
        await route.fulfill({ status: 204, headers: cors })
        return
      }

      const json = (body: unknown) =>
        route.fulfill({
          status: 200,
          headers: { ...cors, "content-type": "application/json" },
          body: JSON.stringify(body),
        })

      if (url.pathname === "/api/auth/me") return json({ admin })
      if (url.pathname === "/api/events") return json({ events: [] })
      if (url.pathname === "/api/tags") return json({ tags: [] })
      if (url.pathname === "/api/admin/event-suggestions") {
        return json({ suggestions: [suggestion] })
      }
      if (
        url.pathname === `/api/admin/event-suggestions/${suggestion.id}/approve`
      ) {
        return json({ suggestion: { ...suggestion, status: "approved" } })
      }

      return json({ error: `Unhandled ${url.pathname}` })
    })

    await page.goto("/admin", { waitUntil: "domcontentloaded" })

    await expect(
      page.getByRole("heading", { name: "Cola de revisión" })
    ).toBeVisible()

    await page.getByRole("button", { name: "Vista previa" }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole("heading", { name: suggestion.title })
    ).toBeVisible()
    await expect(
      dialog.getByRole("link", { name: "Agregar a Google Calendar" })
    ).toBeVisible()
    await expect(dialog.getByRole("button", { name: "Aprobar" })).toBeEnabled()

    await dialog.getByRole("button", { name: "Aprobar" }).click()

    await expect(dialog).toBeHidden()
    await expect(
      page.getByText("Sugerencia convertida en evento.")
    ).toBeVisible()
    await expect(page.getByText("Aprobado")).toBeVisible()
  })
})
