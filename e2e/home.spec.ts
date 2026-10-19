import { expect, test } from "@playwright/test"

test.describe("Home page", () => {
  test("shows the Next Events page", async ({ page }) => {
    // The app is a client-rendered SPA and loads web fonts from a CDN, so wait
    // for the document instead of the full `load` event.
    await page.goto("/", { waitUntil: "domcontentloaded" })

    await expect(page.getByText("Next Events")).toBeVisible()
  })
})
