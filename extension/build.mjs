import { cp, mkdir, rm } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import * as esbuild from "esbuild"

const root = dirname(fileURLToPath(import.meta.url))
const outdir = join(root, "dist")
const watch = process.argv.includes("--watch")

const shared = {
  bundle: true,
  target: ["chrome120", "firefox128"],
  logLevel: "info",
  legalComments: "none",
}

/** @type {esbuild.BuildOptions[]} */
const builds = [
  {
    ...shared,
    entryPoints: [join(root, "src/popup/main.ts")],
    outfile: join(outdir, "popup.js"),
    format: "esm",
  },
  {
    // Injected with scripting.executeScript({ files }); the value of the last
    // statement is what the popup receives, hence the footer call.
    ...shared,
    entryPoints: [join(root, "src/content/extract.ts")],
    outfile: join(outdir, "extract.js"),
    format: "iife",
    globalName: "parbinExtractor",
    footer: { js: "parbinExtractor.extractCurrentPage();" },
  },
]

await rm(outdir, { recursive: true, force: true })
await mkdir(outdir, { recursive: true })
await cp(join(root, "static"), outdir, { recursive: true })

if (watch) {
  for (const options of builds) {
    const ctx = await esbuild.context(options)
    await ctx.watch()
  }
  console.log("watching src/ (static/ changes need a rebuild)")
} else {
  await Promise.all(builds.map((options) => esbuild.build(options)))
}
