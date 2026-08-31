# bb-kit — Foundation Plan **r2** (Web-First Pure UI Kit)

**Date:** 2026-08-30 · **Supersedes:** `bb-kit-foundation-2026-08-30.md` (r1) · **Repo:** `/Users/bubbles/dev/bb-kit` (empty, greenfield) · **Source:** `../bubble-kit` (React Native)

**r2.1 (same day):** replaces Storybook with the shadcn **registry template** + a purpose-built **review harness** (§6), because the builder is an agent and the human's only lever is visual review. Revises D9/D10.

**What changed from r1:** the research is unchanged and still stands (see r1 §2 — do not re-derive it). This revision converts r1's nine deferred "builder judgement" calls into **decisions with values**, fixes four defects that r1 would have ported from `../bubble-kit` verbatim, resolves the kit-boundary contradiction between r1 §3 and r1 §5, and adds a **Phase 0.5** so Phases 1–3 are mechanical.

---

## 1. Goal & Non-Goals

**Goal:** Ship `bb-kit` as a **pure web UI kit** (no apps inside) that agents consume via `shadcn` registry + Skill, and a human reviews visually in the built-in review harness (§6). Extract the durable ideas from `../bubble-kit` into a modern web idiom (Tailwind v4 + `cva` + `cn()` + `Slot/asChild`). First consumer is an external portfolio Notion feed with tag filtering.

**The kit ships three layers, and the boundary is enforced:**
1. **Tokens** — DTCG JSON → CSS vars. The only cross-platform artifact.
2. **Components** — presentational, generic, no domain types.
3. **Headless logic** — app-agnostic filtering/faceting (§4). *New in r2.*

**Non-goals for v0:** Figma pipeline, SwiftUI package, multi-brand theming, npm `dist/`, private auth, visual regression (Chromatic), Storybook.

**Boundary rule (reworded from r1):** no *consumer* app lives in this repo — no portfolio, no Notion code, no `Post` type. The registry template's Next.js site is **docs + review surface**, not a consumer, and is in scope.

---

## 2. Decisions r1 left open — now closed

Each of these was a `§6 judgement call` in r1. Builder should treat these as spec, not suggestion. Where a decision is genuinely reversible it says so.

| # | Question (r1 §6) | **Decision** | Why |
|---|---|---|---|
| D1 | Light/dark model | **Semantic-only names + class-based `.dark`.** No `light`/`dark`/`semiDark` suffixes in the public API. `ThemeProvider` toggles a class on `<html>`; `@media (prefers-color-scheme)` only sets the *initial* class. | Source model is *manual per-call-site* (`Color.background.dark`); shadcn's is *themed*. They're incompatible and r1 never said which wins. A toggle is required for a portfolio site, which rules out media-query-only. |
| D2 | Raw `gray_250` keys vs semantic scale | **Primitives are private.** `tokens/primitive.tokens.json` is an input to Style Dictionary and is *not* exported as utilities. Only semantic names reach Tailwind. | Prevents re-creating `Color = {...Palette, ...}` (colors.ts:88), which is what let the RN kit sprawl. |
| D3 | Exact OKLCH values | **Computed — see §3.** | Highest-leverage decision in the plan; punting it made r1 unbuildable. |
| D4 | Boolean `<Text sm>` vs `variant=` | **Booleans for `Text` only; `cva` variants everywhere else.** `Text` is the one component where the boolean affordance was explicitly confirmed as wanted, and it's the one with no `variant` axis to lose. Documented in `SKILL.md` as a deliberate exception. | r1 left the kit reading as two kits. One documented exception is coherent; an undocumented split is not. Requires the collision audit in §5. |
| D5 | i18n (`tKey` / `next-intl` / plain) | **Plain `children`. `tKey`, `count`, `values`, `components` are dropped.** | A pure UI kit must not own a translation runtime; it makes `react-i18next` a peer dep of every consumer. Consumers pass already-translated strings. |
| D6 | `Space x1_5=12` mapping | **Map to Tailwind's native scale** (`x1`→`2`/8px, `x1_5`→`3`/12px, `x2`→`4`/16px). Escape hatch is arbitrary values (`p-[13px]`), not a `Padding(13)` runtime. | Tailwind already *is* the spacing engine; re-implementing `Padding()` means shipping a second one. |
| D7 | Font stack | **`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`** as `--font-sans`. No webfont in v0. | `HelveticaNeue*` weights are an RN artifact. Zero-cost, zero-CLS, and `Helvetica Neue` still sits in the stack for continuity on Apple platforms. |
| D8 | Layout spacers | **Drop `VSpacer`/`HSpacer`/`VDivider` as components.** Use `gap-*`; ship `Separator` (a real `role="separator"`) instead. | Spacer components exist because RN has no `gap`. Web does. |
| D9 | Repo skeleton + registry hosting | **Start from shadcn's official registry template** (verify its current name/state in Phase 0). Its Next.js app hosts `public/r/*.json` **same-origin** and doubles as the docs/review site. GitHub raw (`samerce/bb-kit/{name}`) stays as the fallback if the template has drifted. | r1's `https://<host>/...` named no host and no phase deployed it, so its own Phase 0 validation could not pass. The template ships the registry plumbing *and* the surface §6 needs — one artifact instead of two. Forking `shadcn-ui/ui` itself is wrong: you'd inherit the CLI, docs site and release workflows, and take merge conflicts in exactly the token/API layers bb-kit deliberately diverges in. |
| D10 | Storybook | **Dropped entirely.** Replaced by the template app's **review harness** (§6) plus `vitest` + `@testing-library/react` + `jest-axe`. | Two doc systems for 11 components is one too many. The harness renders in the real Next + Tailwind + font environment a consumer gets, so what the human reviews is what ships. Trade accepted: no live prop controls, no auto props tables. Non-negotiable replacement: **axe moves into CI** (`jest-axe`), where it fails a build instead of sitting in a panel nobody opens — load-bearing given the inherited AA failure in §3.2. |
| D11 | `base` vs `radix` | **`base`** (Base UI). Recorded in `components.json`; not revisited. | 2026 default; r1 already leaned this way. Reversible but not worth re-litigating. |
| D12 | Token file split | **Two files** — `primitive.tokens.json`, `semantic.tokens.json`. | Directly encodes D2. Don't let a linter decide an architecture question. |

---

## 3. Tokens — actual values (Phase 1 is now transcription, not design)

### 3.1 Four defects in `../bubble-kit/src/styles/colors.ts` — fix during port, do not carry across

1. **The gray scale is not monotonic**, despite colors.ts:21 documenting "0–900, where 900 is the darkest". Measured OKLCH lightness: `gray_200` 96.0% > `gray_50` 95.6% > `gray_150` 93.4% ≈ `gray_300` 93.3% > `gray_100` 90.4% > `gray_400` 85.8% > `gray_250` 82.1%. So `300` is *lighter* than `250` and `100`. **Fix:** re-index the ramp by measured lightness during transcription; the old key names do not survive (they're private per D2, so nothing breaks).
2. **`teal_transl_100: '#4F29B75C'` is purple**, not teal (it's `primary` at 36% alpha). **Fix:** rename `primary-translucent-*`.
3. **`pink_500: primary` and `pink500: '#E91E63'` differ only by an underscore** and are unrelated colors. **Fix:** drop both; neither is a semantic role.
4. **`muted`/`mutedLight` are both `gray_250`** — a distinction with no difference. **Fix:** collapse; the real split is `muted` (surface) vs `muted-foreground` (text), which is defect 5 below.

### 3.2 Contrast audit (measured, sRGB relative luminance)

| Color | Hex | OKLCH | on `#fff` | on `#11112B` |
|---|---|---|---|---|
| `primary` | `#4F29B7` | `oklch(42.9% 0.205 286.3)` | **9.00** ✅ | 2.05 ❌ |
| `purple_300` | `#AC80D2` | `oklch(67.4% 0.126 308.0)` | 3.10 ❌ | **5.95** ✅ |
| `purple_900` | `#11112B` | `oklch(19.4% 0.051 280.5)` | 18.44 ✅ | — |
| `gray_250` (`muted`) | `#C4C4C6` | `oklch(82.1% 0.003 286.3)` | **1.74** ❌ | 10.59 ✅ |
| `gray_600` | `#787B94` | `oklch(58.9% 0.038 279.8)` | 4.15 ❌ | 4.44 ❌ |
| `gray_700` | `#595C75` | `oklch(48.2% 0.040 279.4)` | **6.54** ✅ | 2.82 ❌ |
| `gray_500` | `#AEB0C4` | `oklch(76.2% 0.029 281.2)` | 2.14 ❌ | **8.61** ✅ |
| `red_500` | `#EA151F` | `oklch(59.5% 0.235 27.2)` | 4.54 ✅ | 4.06 ❌ |
| `green_400` | `#64BD79` | `oklch(72.5% 0.131 149.8)` | 2.31 ❌ | 7.99 ✅ |
| `yellow_500` | `#FFC008` | `oklch(84.2% 0.172 84.4)` | 1.64 ❌ | 11.23 ✅ |

**Defect 5 (the important one):** `Color.muted = gray_250` is used as a **text** color (`Placeholder` → `Colored.muted`, `Text.tsx:61`) at **1.74:1** — a WCAG AA failure inherited straight from the source, and *no* gray in the ramp passes 4.5:1 on white below `gray_700`. r1 filed this under "OKLCH drift, re-test with axe"; it is not drift, it is a pre-existing bug. **`muted-foreground` must be `gray_700`, not `gray_250`.**

**Defect 6:** `primary` fails on dark (2.05:1). Dark mode must use a *lighter* primary — `purple_300` at 5.95:1. `red/green/yellow` likewise flip. This is why D1's semantic-only model is mandatory: the same token name resolves to different hues per theme.

### 3.3 Semantic set (write these into `semantic.tokens.json`)

Names follow shadcn so the MCP and every trained agent already know them.

```
                      light                       dark
background            #FFFFFF                     purple_900  #11112B
foreground            purple_900 #11112B          gray_50     #EFF0F5
card                  #FFFFFF                     gray_900    #22242F
card-foreground       = foreground                = foreground
muted                 gray_50    #EFF0F5          gray_800    #3D3F52
muted-foreground      gray_700   #595C75  (6.54)  gray_500    #AEB0C4  (8.61)
primary               #4F29B7            (9.00)   purple_300  #AC80D2  (5.95)
primary-foreground    #FFFFFF                     purple_900  #11112B
accent                purple_50  #F0E8FF          purple_600  #2E187F
accent-foreground     purple_600 #2E187F          purple_50   #F0E8FF
border                gray_400   #CECFDD          gray_800    #3D3F52
input                 = border                    = border
ring                  = primary                   = primary
destructive           red_500    #EA151F  (4.54)  #FF6B6B  (retune, ≥4.5 on #11112B)
```

- `--bb-*` namespace for primitives; semantic vars keep bare shadcn names so `bg-card` / `text-muted-foreground` work unmodified.
- `@theme` for real tokens (tree-shaken), `@theme inline` **only** for `var(--bb-*)` aliases. Wrap in `@layer tokens, base, components, utilities`. Add `@source "src/components/ui/**/*.{ts,tsx}"`.
- Alpha survives conversion: `purple_transl_100 #1B1A432E` → `oklch(24.54% 0.075 280.392 / 18%)`.

### 3.4 Type scale (r1 had none)

`xs3:8 … xl7:32` is opaque and 8px is not a legible web size. Replace with a Tailwind-aligned scale so `<Text sm>` means what an agent expects:

| name | size | line-height | use |
|---|---|---|---|
| `xs` | 0.75rem / 12px | 1.33 | metadata, tag counts |
| `sm` | 0.875rem / 14px | 1.43 | secondary, captions |
| `base` | 1rem / 16px | 1.5 | body — **default** |
| `lg` | 1.125rem / 18px | 1.44 | card titles |
| `xl` | 1.375rem / 22px | 1.27 | section headings |
| `2xl` | 1.75rem / 28px | 1.21 | page title |
| `3xl` | 2.25rem / 36px | 1.11 | hero |

Weights: `400 / 500 / 600 / 700` as `normal / medium / semibold / bold` (drops `HelveticaNeue*`).

### 3.5 Tokens r1 omitted entirely but AGENTS.md promises

- **Focus:** `--ring: var(--color-primary)`, `--ring-offset: 2px`. Every interactive component ships `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- **Elevation:** `--shadow-xs/sm/md` only (three steps; a flat kit doesn't need six).
- **Radius:** `--radius` `0.5rem` base with `sm/md/lg/xl` derived — matches source `BorderRadiusValues x1:4→x4:16`.
- **Motion:** `--duration-fast 120ms`, `--duration 200ms`, `--ease-out cubic-bezier(0.2,0,0,1)`. All motion wrapped in `motion-safe:`.
- **Target size:** **24px minimum** (WCAG 2.2 AA 2.5.8), 44px only for primary touch affordances. r1's blanket 44px is an iOS HIG import that makes desktop UI read as a scaled-up phone.

---

## 4. Headless logic — `filterItems` (the r1 boundary fix, kept reusable)

r1 §3 defended "pure kit, feed is external" and r1 §5 then put `Post[]` and `filterPosts(posts, …)` *inside* the kit. Both halves were half-right: the **logic** is genuinely reusable across apps, the **`Post` type** is not.

**Resolution:** ship the logic **generic and domain-free**, as its own registry item — installable without pulling in any component.

`src/lib/filter-items.ts` → registry item `@bb-kit/filter-items`, `type: registry:lib`, **zero dependencies, zero React**.

```ts
export interface FilterCriteria {
  /** free-text query; case- and diacritic-insensitive, whitespace-tokenized */
  query?: string
  /** selected tag values */
  tags?: readonly string[]
  /** 'any' = union (default, right for discovery), 'all' = intersection */
  match?: 'any' | 'all'
}

export interface FilterAccessors<T> {
  getTags?: (item: T) => readonly string[] | undefined
  /** fields to search; joined before matching. Default: [] (query is a no-op) */
  getSearchText?: (item: T) => string
}

/** Pure, stable-order, allocation-light. Returns `items` itself when no criteria are active. */
export function filterItems<T>(items: readonly T[], criteria: FilterCriteria, accessors?: FilterAccessors<T>): readonly T[]

/** Facet counts for building a FilterBar — descending by count, then alpha. */
export function collectTags<T>(items: readonly T[], getTags: (item: T) => readonly string[] | undefined): Array<{ tag: string; count: number }>

/** Counts *as they would be after* the current selection — greys out dead-end tags. */
export function collectTagsWithSelection<T>(items: readonly T[], criteria: FilterCriteria, accessors: FilterAccessors<T>): Array<{ tag: string; count: number; disabled: boolean }>

/** Immutable toggle for controlled `string[]` state. */
export function toggleTag(selected: readonly string[], tag: string): string[]

export function normalizeQuery(q: string): string  // NFD fold, strip combining marks, lowercase, collapse ws
```

Plus `src/hooks/use-filtered-items.ts` → `@bb-kit/use-filtered-items` (depends on the lib): memoized, with the query debounce (`200ms`, cancel-on-unmount) built in — the part every consumer re-implements badly.

The portfolio's `filterPosts` then becomes a three-line adapter it owns:
```ts
export const filterPosts = (posts: Post[], c: FilterCriteria) =>
  filterItems(posts, c, { getTags: p => p.tags, getSearchText: p => `${p.title} ${p.excerpt}` })
```

**Why this is the right cut:** the reusable substance is tag-set semantics, `any`/`all`, facet counting with dead-end detection, diacritic-folded search, and debounce — all of which are app-agnostic and all of which are what people actually get wrong. `Post` is not reusable and stays out. `Feed` (§5) is generic over `T` with `renderItem` and does no filtering; composing them is the consumer's call. **Test this file hardest** — it's the only part of the kit with real logic, and it's plain functions, so it's cheap (D10).

---

## 5. Components — v0 set (11), each with a harness page + registry entry

Build in this order. Every component ships source + registry entry + `/review` harness page (§6) + tests. Every entry needs a real `description` and correct `registryDependencies` — that is what the shadcn MCP ranks on.

**Wave 1 — primitives**
1. `text` — booleans per D4. **Blocking prerequisite:** audit every boolean name against `React.HTMLAttributes`. Known collisions to rename or exclude: `title`, `color`, `hidden`, `size`, `slot`, `translate`. Do **not** port the source's `for (const prop in props)` scan (`Text.tsx:61`) — on web it silently swallows legitimate DOM attributes. Use an explicit const-array of style prop names, destructure them, spread the remainder.
2. `stack` — `VStack`/`HStack` over `gap-*`.
3. `button` — `cva` (`default`/`accent`/`ghost`/`link`) × (`sm`/`md`/`lg`), `asChild`.
4. `card` — `asChild` (a card is often a link).
5. `skeleton` — `motion-safe:animate-pulse`; static under `prefers-reduced-motion`.
6. `badge` — from `PillButton`. Toggle mode uses `aria-pressed` on a real `<button>`.
7. `separator` — replaces the dropped spacers (D8).

**Wave 2 — feed set**
8. `empty-state` — a real component, not a `Feed` branch. AGENTS.md already references `ContentUnavailableView` patterns; it needs something to point at.
9. `feed` — **generic**: `items: readonly T[]`, `renderItem: (item: T) => ReactNode`, `getKey`, `loading`, `error`, `empty`, `onEndReached` + `IntersectionObserver` sentinel. **No filtering, no `Post`.** Renders `ul`/`li`.
10. `post-card` — presentational. **Two boundaries r1 missed:** (a) `asChild` so `next/link` wraps it; (b) the cover image is a **slot** (`cover?: ReactNode`), never a hardcoded `<img>` — it's the LCP element and a hardcoded tag fights `next/image`. Ships `line-clamp` on excerpt.
11. `filter-bar` — controlled `tags: string[]` / `onTagsChange`, `query` / `onQueryChange`. **Flat tabbable buttons, no roving tabindex** — roving is for single-selection widgets (radio/tablist/toolbar); a multi-select toggle group must be individually tabbable. `role="group"` + `aria-label`, `aria-pressed` per badge.

**Deferred to v1:** `Banner`, `TextInput`, `Sheet`, `TabMenu`, `SearchField` (standalone), `Spinner`, `Checkbox`, `Reveal`.

**`src/styles/foundation-helpers.ts`:** a thin *map* from the bubble-kit vocabulary to Tailwind class strings — **not** a port of the `mapObject`/`ViewStyle` atom engine. Per D6, Tailwind is the spacing engine. Header comment must say so, or the next agent will rebuild it.

---

## 6. Review harness — the human's only lever

**An agent builds this kit; the human never opens the source.** Visual review is therefore not documentation, it is the *acceptance mechanism*, and it has to catch the things agents actually get wrong: unstyled focus rings, states that were never implemented, dark mode that was never opened, text that doesn't wrap, empty states that render as blank.

Built as routes in the template's Next.js app. **Phase 2 is not complete for a component until its harness page exists** — no page, no merge.

### 6.1 Structure

```
app/review/
├── page.tsx              # index: every component, one card each, at a glance
├── [component]/page.tsx  # the matrix (below)
├── tokens/page.tsx       # swatches: every semantic pair, light+dark, contrast ratio printed
└── _harness/
    ├── matrix.tsx        # <Matrix rows={variants} cols={sizes}> — labelled grid
    ├── states.tsx        # forced pseudo-states (see 6.2)
    └── fixtures.ts       # the torture content (see 6.3)
```

### 6.2 Every component page renders four blocks, always in this order

1. **Variant × size matrix** — every combination, labelled, no interaction needed to see them.
2. **States row** — `default · hover · focus-visible · active · disabled · loading`. Hover and focus **cannot be screenshotted**, so the harness renders each state *forced* via a `data-force-state` attribute that the component's classes also key off (dev-only). Without this an agent can ship an invisible focus ring and no review will catch it.
3. **Content torture** — the fixtures in 6.3, to expose overflow, wrapping and clamping.
4. **Both themes, side by side** — two panes on one page, `.dark` scoped to a container, not the document. Reviewing dark mode behind a toggle means it gets reviewed once and then never again.

### 6.3 Fixtures (`_harness/fixtures.ts`) — shared by every page

Empty string · single character · a 200-char title · a word with no spaces 60 chars long · CJK and RTL samples · 0 / 1 / 3 / 24 tags · missing cover image · missing date · a 2,000-item feed (virtualization sanity) · `loading` and `error` simultaneously.

### 6.4 Agent self-verification (runs before handing over)

The building agent must, per component, and paste results into the PR:
- Screenshot `/review/[component]` at **375 / 768 / 1440** widths, light and dark — 6 images.
- `pnpm test` green, including `jest-axe` on every harness page.
- Assert the §3.3 contrast pairs numerically in a test, not by eye.
- Tab through the page and record the focus order.

### 6.5 Human review checklist (what you actually do)

Open `/review`, then per component: focus ring visible in **both** themes · disabled distinguishable from muted · nothing clipped by the torture fixtures · dark mode not merely inverted but correct per §3.3 · spacing on the 8px scale (D6) · touch targets ≥24px (§3.5).


## 7. Phases

### Phase 0 — bootstrap (0.5 day)
**First action:** inspect shadcn's registry template and confirm it still ships `registry.json` + `shadcn build` + `public/r` hosting (D9). If it has drifted, scaffold a plain Next.js app and fall back to GitHub-raw hosting — **say which path you took in the PR.**
Then: `tsconfig` (`strict`, `isolatedDeclarations`); `tailwindcss@^4.1`; `shadcn init` with `base` (D11); `style-dictionary@^4`; `vitest` + `@testing-library/react` + `jest-axe` (D10); `changesets`; LICENSE.
`components.json` with aliases, `tailwind.css`, and the `@bb-kit` registry entry.
**Validate:** `npx shadcn registry validate ./registry.json`; `pnpm dlx shadcn@latest mcp init --client opencode`; `/review` route renders empty shell.

### Phase 0.5 — design decisions (0.5 day, **no code**) — *new in r2*
Write `docs/decisions.md` recording §2 D1–D12 and §3.3/§3.4 as the frozen contract, then diff the §3.3 table against a rendered swatch sheet and adjust only what fails axe. Everything downstream is mechanical after this. *If §3's values survive review unchanged, this phase is 20 minutes — that's the point.*

### Phase 1 — tokens (1 day, was 1–1.5)
Transcribe §3 into `tokens/{primitive,semantic}.tokens.json` (DTCG `$value`/`$type`), applying defects 1–6. Style Dictionary → `src/styles/tokens.css`. Include the hex→OKLCH script as `scripts/hex-to-oklch.mjs` (alpha-preserving) so re-tuning is repeatable.
**Validate:** `bg-primary` / `text-muted-foreground` utilities exist; `.dark` flips; `/review/tokens` renders every semantic pair in both themes with its measured contrast ratio printed; a test asserts those ratios ≥4.5 (text) / ≥3.0 (UI); `style-dictionary build` warning-free.

### Phase 2 — logic + components (3–4 days, was 2–3)
`filter-items` + `use-filtered-items` first (§4) — pure functions, fully unit-tested, no UI to block on. Then Wave 1, then Wave 2 (§5). **Per component the deliverable is four things: source + registry entry + `/review/[component]` harness page (§6) + tests.** Build `_harness/` (matrix, forced states, fixtures) *before* the first component, so component 1 is reviewed the same way as component 11.
**Validate (human):** open `/review` — every component visible in both themes with all states forced; then `FilterBar` toggling 6 tags filters a `PostCard` grid, with skeletons and `EmptyState`.
**Validate (agent):** `npx create-next-app /tmp/kit-test && npx shadcn add @bb-kit/post-card --dry-run --diff` — semantic tokens only, zero raw hex.

### Phase 3 — agent layer (1 day)
`SKILL.md` orchestrator + at most 3 lazy `references/` (`tokens`, `components`, `filtering`). `AGENTS.md` always-on: composition-first, semantic vars only (`bg-card`, never hex), 24px min target (44px touch-primary), `ul`/`li` feed semantics, `EmptyState` over ad-hoc empty branches, `Text` booleans are a documented exception (D4). `llms.txt`. Symlink into `.claude/skills` + `.agents/skills`.
**Validate:** prompt OpenCode *"add a feed with tag filtering using bb-kit"* → picks `feed` + `filter-bar` + `badge` + `filter-items`, semantic colors, passes `get_audit_checklist`.

**Estimate: 7–8 working days (the harness adds ~1)**, vs r1's ~6 for strictly less scope. r1's Phase 2 also silently contained the whole type-scale and i18n design; that work now lives in Phase 0.5 and §3, where it's cheap.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| Porting RN atoms literally | `foundation-helpers.ts` is a map, not an engine (D6, §5). Header comment enforces it. |
| `Text` boolean props colliding with DOM attributes | Explicit prop-name const array + audit (§5 item 1). Not the source's `for…in` scan. |
| Scope creep past 11 components | v1 list in §5 is closed. New components need a real consumer first. |
| Contrast regressions on re-tune | `scripts/hex-to-oklch.mjs` prints contrast alongside; axe + numeric ratio assertions run in CI over `/review/tokens`. |
| Registry rename breaking consumers | `changesets` from Phase 0; registry item names are public API. |
| Harness rots / agent skips it | "No harness page, no merge" is a Phase 2 gate; `/review` index makes a missing page visible instantly. |
| Agent ships an invisible focus ring or an unimplemented state | Forced pseudo-states (§6.2) put them on screen; a screenshot at 6 viewport/theme combos is required in the PR. |
| Dark mode reviewed once, then never | Both themes render side by side on every page (§6.2), never behind a toggle. |

---

## 9. Next step

Execute **Phase 0 → 0.5 → 1**, then open a PR containing `tokens.css`, `docs/decisions.md`, and a working `/review/tokens` page with light/dark screenshots attached. Do not start Phase 2 components before `_harness/` exists.

Do not add `apps/`, a `Post` type, or Notion code to `bb-kit`.
