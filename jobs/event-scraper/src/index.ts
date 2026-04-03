import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { fetchKnownSourceUrls, submitSuggestion } from "./api-client.js"
import { getBrowser, closeBrowser } from "./browser.js"
import { config } from "./config.js"
import { logger } from "./logger.js"
import { strategyForSourceDomain } from "./strategies/registry.js"
import { sourcesFileSchema } from "./types.js"
import { shuffle } from "./util/shuffle.js"
import { canonicalEventUrl } from "./util/url.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadSources() {
  const path = join(__dirname, "..", "sources.json")
  const raw = readFileSync(path, "utf-8")
  const data = JSON.parse(raw) as unknown
  return sourcesFileSchema.parse(data)
}

async function main(): Promise<void> {
  const known = await fetchKnownSourceUrls()
  logger.info({ count: known.size }, "loaded known source URLs")

  const sources = shuffle(loadSources())
  logger.info(
    { order: sources.map((s) => s.url) },
    "source order (randomized per run)",
  )
  const browser = await getBrowser()
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ParbinEventScraper/1.0",
  })
  context.setDefaultNavigationTimeout(config.navigationTimeoutMs)

  let submitted = 0
  let skipped = 0
  let errors = 0

  try {
    for (const source of sources) {
      const strategy = strategyForSourceDomain(source.domain)
      if (!strategy) {
        logger.warn({ domain: source.domain }, "no strategy for domain, skip source")
        continue
      }

      const page = await context.newPage()
      try {
        logger.info({ url: source.url, strategy: strategy.id }, "discovering event links")
        const discovered = await strategy.discoverEventUrls(page, source.url)
        logger.info({ count: discovered.length, listing: source.url }, "discovered links")

        const toScrape = discovered.filter((u) => !known.has(canonicalEventUrl(u)))
        skipped += discovered.length - toScrape.length

        for (const url of toScrape) {
          const canonical = canonicalEventUrl(url)
          if (known.has(canonical)) continue

          try {
            const payload = await strategy.scrapeEvent(page, url)
            if (!payload) {
              logger.info({ url: canonical }, "skip non-tech or incomplete event")
              continue
            }
            await submitSuggestion(payload)
            known.add(canonical)
            submitted += 1
          } catch (e) {
            errors += 1
            logger.error({ err: e, url: canonical }, "scrape or submit failed")
          }
        }
      } catch (e) {
        errors += 1
        logger.error({ err: e, source: source.url }, "listing failed")
      } finally {
        await page.close()
      }
    }
  } finally {
    await context.close()
    await closeBrowser()
  }

  logger.info({ submitted, skippedKnown: skipped, errors }, "scraper run finished")
}

main().catch((e) => {
  logger.error(e, "fatal")
  process.exitCode = 1
})
