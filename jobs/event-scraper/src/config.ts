import { existsSync } from "node:fs"
import { join } from "node:path"
import { loadEnvFile } from "node:process"
import { z } from "zod"

const envFilePath = join(process.cwd(), ".env")
if (existsSync(envFilePath)) {
  loadEnvFile(envFilePath)
}

const envSchema = z.object({
  PARBIN_API_URL: z.string().url().optional(),
  SCRAPER_HEADLESS: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v !== "false"),
  SCRAPER_TIMEOUT_MS: z.coerce.number().positive().optional(),
})

const parsed = envSchema.safeParse(process.env)

export const config = {
  apiBaseUrl: parsed.success
    ? (parsed.data.PARBIN_API_URL ?? "http://localhost:8080")
    : "http://localhost:8080",
  headless: parsed.success ? (parsed.data.SCRAPER_HEADLESS ?? true) : true,
  navigationTimeoutMs: parsed.success
    ? (parsed.data.SCRAPER_TIMEOUT_MS ?? 45_000)
    : 45_000,
}
