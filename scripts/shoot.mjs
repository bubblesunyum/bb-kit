/**
 * Screenshots Storybook stories into /tmp, where `scripts/review.sh` picks them
 * up and `reviewer-design` reads them.
 *
 * Nothing else in the repo writes those files, so before this every packet said
 * "None" and any on-screen change went to review unseen.
 *
 *   node scripts/shoot.mjs           # the stories this change touched
 *   node scripts/shoot.mjs button    # only ids containing "button"
 *   node scripts/shoot.mjs --all     # every story
 *
 * Each shot is one story in the four-up layout, so a single image carries all
 * four palette-and-mode combinations — the same trick `a11y.mjs` uses, and the
 * reason a reviewer can spot a colour that only breaks in clash dark.
 *
 * Reads the static build rather than a dev server, so nothing rebuilds under
 * the run. Playwright is imported by path because a script outside the repo
 * root cannot resolve it by name.
 */
import { execFileSync } from "node:child_process"
import { createReadStream, existsSync, readFileSync } from "node:fs"
import { createServer } from "node:http"
import { basename, dirname, extname, join, normalize } from "node:path"

async function shoot(argument) {
  if (!existsSync(join(BUILD, "index.json"))) {
    console.error("no storybook-static/index.json — run `npm run build-storybook` first")
    return 1
  }

  const all = Object.values(JSON.parse(readFileSync(join(BUILD, "index.json"), "utf8")).entries)
    .filter((entry) => entry.type === "story")
  const stories = select(all, argument)

  if (stories.length === 0) {
    console.log("shoot: no stories matched — nothing captured")
    return 0
  }

  const server = serveBuild()
  const { chromium } = (await import(join(ROOT, "node_modules/@playwright/test/index.js"))).default
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: VIEWPORT })
  const base = `http://localhost:${server.address().port}/iframe.html`

  const taken = []
  const failures = []

  for (const story of stories) {
    /* One story that hangs must not cost the rest of them their captures. */
    try {
      taken.push(await capture(page, base, story))
    } catch (error) {
      failures.push(`${story.id}  ${error.message.split("\n")[0]}`)
    }
  }

  await browser.close()
  server.close()

  console.log(`shoot: ${taken.length} captures`)
  for (const path of taken) console.log(`  ${path}`)
  for (const failure of failures) console.log(`  failed: ${failure}`)
  return failures.length === 0 ? 0 : 1
}

/** One story, all four palettes, written where review.sh looks. */
async function capture(page, base, story) {
  await page.goto(`${base}?id=${story.id}&globals=layout:four-up`, { timeout: TIMEOUT })
  const root = page.locator(ROOT_SELECTOR)
  await root.waitFor({ timeout: TIMEOUT })
  /* The four-up cells animate nothing, but fonts and the pulse on Skeleton do
     land a frame late, and a shot taken before them reads as a broken story. */
  await page.waitForTimeout(SETTLE)

  // The story id, not a caption: a caption written beside the file goes stale
  // the moment the story is recaptured mid-review, and review.sh already orders
  // captures by when they were taken and says the last one is the current one.
  const path = `/tmp/bbk-${story.id}.png`
  await root.screenshot({ path })
  return path
}

/**
 * Which stories to shoot. `--all` is every one; a plain word is a substring of
 * the id; nothing at all means the stories belonging to the files this change
 * touched, which is the case that should need no argument at all.
 *
 * A story counts as touched by more than its own file. Most changes edit a
 * component or a token and not the story beside it, and matching story files
 * alone meant those captured nothing at all — a change to the token CSS went to
 * review unseen even though Tokens/Roles paints every one of its swatches. So a
 * changed file also claims the story sharing its name in its own directory.
 *
 * A file with no namesake claims every story beside it, but only when it isn't
 * a component: palette.ts has no palette.stories.tsx and is nonetheless what
 * Tokens/Roles is a picture of, while a .tsx with no story of its own is not in
 * Storybook at all and claiming its sixteen siblings would bury the capture
 * that matters. Name a filter for those — `node scripts/shoot.mjs theme`.
 */
function select(stories, argument) {
  if (argument === "--all") return stories
  if (argument) return stories.filter((story) => story.id.includes(argument))

  const changed = changedFiles().filter(Boolean)
  // index.json holds importPath as "./src/components/badge.stories.tsx".
  const pathOf = (story) => story.importPath.replace(/^\.\//, "")

  const claimed = new Set()
  for (const file of changed) {
    const siblings = stories.filter((story) => dirname(pathOf(story)) === dirname(file))
    const namesakes = siblings.filter((story) => stem(pathOf(story)) === stem(file))
    const claims = namesakes.length > 0 ? namesakes : file.endsWith(".tsx") ? [] : siblings
    for (const story of claims) claimed.add(story)
  }
  return stories.filter((story) => claimed.has(story))
}

/** Everything before the first dot: badge.test.tsx and badge.stories.tsx are both "badge". */
function stem(file) {
  return basename(file).split(".")[0]
}

/**
 * The files this change touched, uncommitted or in the last commit — the same
 * "review my work almost never means review nothing" fallback review.sh makes.
 * A component and its stories live side by side, so a story is matched by its
 * own file having changed; shoot a component's stories after editing only the
 * component by naming it.
 */
function changedFiles() {
  const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).split("\n")
  const working = [...git("diff", "--name-only", "HEAD"), ...git("ls-files", "--others", "--exclude-standard")]
  return working.some((file) => file) ? working : git("diff", "--name-only", "HEAD~1")
}

/** Static, because a dev server would rebuild under the run. */
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

const ROOT_SELECTOR = "#storybook-root"

/* Wide enough that the four-up quadrants are each about 640px. A story wider
   than about 550px still bleeds across the divider — that is the story's
   problem to fix, and this is the width it has to fit. */
const VIEWPORT = { width: 1280, height: 900 }

// A cold static build still has to parse a chunk the size of Storybook's.
const TIMEOUT = 120000

const SETTLE = 300

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

process.exit(await shoot(process.argv[2]))
