import { expect, test } from "@playwright/test"

test.describe("Home page", () => {
  test("shows the Next Events page in Spanish by default", async ({ page }) => {
    // The app is a client-rendered SPA and loads web fonts from a CDN, so wait
    // for the document instead of the full `load` event.
    await page.goto("/", { waitUntil: "domcontentloaded" })

    await expect(page.getByText("Próximos eventos")).toBeVisible()
  })

  test("switches between Spanish and English in real time", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" })

    await page.getByRole("button", { name: "Cambiar idioma" }).click()
    await page.getByRole("menuitemradio", { name: "English" }).click()

    await expect(page.getByText("Next Events")).toBeVisible()

    await page.getByRole("button", { name: "Change language" }).click()
    await page.getByRole("menuitemradio", { name: "Español" }).click()

    await expect(page.getByText("Próximos eventos")).toBeVisible()
  })
})
