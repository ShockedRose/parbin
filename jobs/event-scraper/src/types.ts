import { z } from "zod"

export const sourceEntrySchema = z.object({
  url: z.string().url(),
  domain: z.string().min(1),
})

export type SourceEntry = z.infer<typeof sourceEntrySchema>

export const sourcesFileSchema = z.array(sourceEntrySchema)

export const SCRAPED_TAG = "scraped"
