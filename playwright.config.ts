import { defineConfig, devices } from "@playwright/test"

// A dedicated port keeps the E2E dev server from colliding with a regular
// `pnpm dev:frontend` instance on 5173. Point E2E_BASE_URL at a running app to
// reuse it instead of starting one.
const PORT = 5199

// The dev server is normally served over HTTPS via vite-plugin-mkcert. Trusting
// that certificate requires sudo, so the E2E harness runs Vite over plain HTTP
// by default. Set E2E_HTTPS=true to target an HTTPS server instead.
const useHttps = process.env.E2E_HTTPS === "true"
const scheme = useHttps ? "https" : "http"
const baseURL = process.env.E2E_BASE_URL ?? `${scheme}://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  // The first request to a cold Vite dev server also optimizes dependencies,
  // which can take a while, so allow generous timeouts.
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    navigationTimeout: 90_000,
    ignoreHTTPSErrors: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm --dir frontend exec vite --port ${PORT} --strictPort`,
        env: { ...process.env, VITE_HTTPS: String(useHttps) },
        url: baseURL,
        ignoreHTTPSErrors: true,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
