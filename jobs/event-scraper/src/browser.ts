import { chromium, type Browser } from "playwright"
import { config } from "./config.js"

let browser: Browser | null = null

export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({ headless: config.headless })
  }
  return browser
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close()
    browser = null
  }
}
