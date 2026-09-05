/**
 * Runs axe against every story in all four palette-and-mode combinations.
 *
 * The Storybook a11y addon runs in a real browser, so unlike §4.6's numbers it
 * sees what actually landed on screen — but only in the one palette and mode
 * the toolbar happens to be on, so a story can pass in forest light and fail in
 * clash dark with nothing to say so. The four-up layout renders all four cells
 * into one document, and axe takes a context, so this checks each cell on its
 * own and names the combination a violation came from.
 *
 * Reads the static build rather than a dev server: `verify.sh --full` already
 * builds Storybook, and a served directory has no bundler waking up mid-run.
 * axe-core is a declared devDependency rather than one borrowed from the a11y
 * addon's tree — a hoist that moved would otherwise look like a broken install.
 *
 *   node scripts/a11y.mjs            # every story
 *   node scripts/a11y.mjs button     # only ids containing "button"
 */
import { createReadStream, existsSync, readFileSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, normalize } from "node:path"

async function sweep(filter) {
  if (!existsSync(join(BUILD, "index.json"))) {
    console.error("no storybook-static/index.json — run `npm run build-storybook` first")
    return 1
  }

  const stories = Object.values(JSON.parse(readFileSync(join(BUILD, "index.json"), "utf8")).entries)
    .filter((entry) => entry.type === "story")
    .filter((entry) => !filter || entry.id.includes(filter))

  const server = serveBuild()
  const { chromium } = (await import(join(ROOT, "node_modules/@playwright/test/index.js"))).default
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const axeSource = readFileSync(join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8")
  const base = `http://localhost:${server.address().port}/iframe.html`

  let checked = 0
  const failures = []

  for (const story of stories) {
    /* One story that hangs or throws must not take the other hundred with it.
       A sweep that stops early still exits non-zero, so the gate stays honest —
       but it reports the story that broke instead of a stack trace, and it
       still says what the rest of them did. */
    try {
      ;({ checked } = await checkStory(page, base, story, axeSource, failures, checked))
    } catch (error) {
      failures.push(`${story.id}  all four  sweep failed\n      ${error.message.split("\n")[0]}`)
    }
  }

  await browser.close()
  server.close()

  console.log(`a11y: ${checked} checks over ${stories.length} stories`)
  for (const failure of failures) console.log(`  ${failure}`)
  return failures.length === 0 ? 0 : 1
}

/** Every combination of one story, appending to the shared failure list. */
async function checkStory(page, base, story, axeSource, failures, checked) {
  await page.goto(`${base}?id=${story.id}&globals=layout:four-up`, { timeout: TIMEOUT })
  await page.waitForSelector(CELL, { timeout: TIMEOUT })
  await page.evaluate(axeSource)

  const cells = await page.$$(CELL)
  for (const [index, cell] of cells.entries()) {
      /* One run per cell rather than one per document: axe reports a CSS
         target, and four cells of the same story produce four targets that
         differ only in an :nth-child nobody can read back to a palette. */
    const violations = await page.evaluate(
      async ([element, busy, attempts]) => {
        /* The a11y addon runs its own axe on every story render, and axe is a
           singleton that refuses a second concurrent run. Waiting it out is
           the whole fix — there is no way to ask the addon not to. Only that
           one message is retried: anything else axe says is a real answer, and
           swallowing it for five seconds would hide it. */
        for (let attempt = 0; ; attempt++) {
          try {
            return (await window.axe.run(element)).violations
          } catch (error) {
            if (attempt >= attempts || !error.message.includes(busy)) throw error
            await new Promise((resume) => setTimeout(resume, 100))
          }
        }
      },
      [cell, BUSY, ATTEMPTS],
    )
    checked++
    for (const { id, nodes } of violations) {
      const where = COMBOS[index] ?? `cell ${index}`
      for (const node of nodes) {
        failures.push(`${story.id}  ${where}  ${id}\n      ${node.target.join(" ")}\n      ${summarize(node)}`)
      }
    }
  }

  return { checked }
}

/** axe nests its explanation one or two levels deep; this is the sentence. */
function summarize(node) {
  const checks = [...node.any, ...node.all, ...node.none]
  return checks.map((check) => check.message).join("; ") || node.failureSummary || ""
}

/** Static, because a dev server would rebuild under the sweep's feet. */
function serveBuild() {
  return createServer((request, response) => {
    const path = join(BUILD, normalize(decodeURIComponent(request.url.split("?")[0])))
    if (!path.startsWith(BUILD) || !existsSync(path)) return response.writeHead(404).end()
    response.writeHead(200, { "content-type": TYPES[extname(path)] ?? "text/plain" })
    createReadStream(path).pipe(response)
  }).listen(0)
}

const ROOT = new URL("..", import.meta.url).pathname

const BUILD = join(ROOT, "storybook-static")

/** A four-up cell: the inner Theme, inside the frame Theme the decorator wraps. */
const CELL = "#storybook-root [data-theme] > [data-theme]"

// The four-up decorator emits its cells in this order, from PALETTES × MODES.
const COMBOS = ["forest light", "forest dark", "clash light", "clash dark"]

// A cold static build still has to parse a chunk the size of Storybook's.
const TIMEOUT = 120000

/** axe's own words for the collision, and how long to wait it out — five seconds. */
const BUSY = "Axe is already running"

const ATTEMPTS = 50

const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
}

process.exit(await sweep(process.argv[2]))
