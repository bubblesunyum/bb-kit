/**
 * Wait until the forced pseudo-states are actually painted. The pseudo-states
 * addon applies its `pseudo-*` classes in a setTimeout inside a React effect,
 * and rewrites the stylesheets on STORY_RENDERED — both land after the cells a
 * sweep waits for. Running axe or a screenshot first checks the rest state:
 * green locally, red on a slower runner, for the same commit.
 *
 * Two signals, because neither implies the other: a rewritten rule in an
 * external stylesheet (the walk is synchronous once STORY_RENDERED fires, so
 * one `.pseudo-` selector means it finished — including inside layers and
 * media queries, which is where the kit's own rules live; inline sheets don't
 * count, because Storybook's own chrome carries static `.pseudo-` selectors
 * that are already there before the walk runs) and a settled class count past
 * a floor (a story with no forced states sits at zero, which is also a correct
 * answer — but only once the effect has had its turn). A story that never
 * settles throws, and both callers fail it loudly rather than passing blind.
 *
 * One module, not a copy in each script: a timing contract in two places is
 * two contracts the next tweak has to keep in step.
 */
export async function settleForPseudoStates(page) {
  // Self-contained: waitForFunction serializes this into the page, so nothing
  // outside its braces exists in there.
  await page.waitForFunction(
    ({ floor }) => {
      const scanRules = (rules) =>
        [...rules].some(
          (rule) => rule.selectorText?.includes(".pseudo-") || (rule.cssRules && scanRules(rule.cssRules)),
        )
      const scanSheets = (container) => {
        let sheets
        try {
          sheets = [...container.styleSheets]
        } catch {
          return false
        }
        if (container.adoptedStyleSheets) sheets.push(...container.adoptedStyleSheets)
        // External sheets only: the kit's utilities arrive as a built file,
        // while the inline sheets are Storybook chrome whose `.pseudo-`
        // selectors predate the walk this waits for.
        return sheets.some((sheet) => {
          if (!sheet.href) return false
          let rules
          try {
            rules = sheet.cssRules
          } catch {
            return false
          }
          return scanRules(rules)
        })
      }
      const state = (window.__bbkSettle ??= { t0: Date.now(), last: -1, steady: 0, rules: false })
      if (!state.rules) state.rules = scanSheets(document)
      const count = document.querySelectorAll('[class*="pseudo-"]').length
      state.steady = count === state.last ? state.steady + 1 : 0
      state.last = count
      return state.rules && Date.now() - state.t0 >= floor && state.steady >= 2
    },
    { floor: SETTLE_FLOOR },
    { polling: 100, timeout: SETTLE_TIMEOUT },
  )
}

// Long enough for the addon's effect and stylesheet walk on a loaded runner;
// a story that needs more fails loudly in the caller rather than passing blind.
const SETTLE_FLOOR = 500
const SETTLE_TIMEOUT = 10000
