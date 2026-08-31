# bb-kit — Foundation Plan (Web-First Pure UI Kit)

**Date:** 2026-08-30 · **Mode:** build (saved after plan-mode review) · **Repo:** `/Users/bubbles/dev/bb-kit` (empty, greenfield) · **Source:** `../bubble-kit` (React Native) · **Reviewer:** `explore` subagent `ses_fabbc75f9ffewPuYFZdeGnOpN2` (80% verdict) · **No work started yet — this file is the spec for the build agent.**

---

## 1. Goal & Non-Goals

**Goal:** Ship `bb-kit` as a **pure web UI kit** (no apps inside) that agents can consume immediately via `shadcn` registry + Skill and humans can browse in Storybook. Extract durable ideas from `../bubble-kit` into a modern web idiom (Tailwind v4 + `cva` + `cn()` + `Slot/asChild`). First real consumer is an **external portfolio Notion feed with tag filtering** — kit provides `Feed/PostCard/Badge/FilterBar` primitives; portfolio repo owns `lib/notion.ts` + data fetching.

**Non-goals for v0:** Figma pipeline (Tokens Studio/Supernova), SwiftUI `packages/ios` (later, ShadKit-shaped, same token names), multi-brand theming, npm `dist/` (`tsup/tsdown`), private auth, visual regression (Chromatic).

---

## 2. Research Summary — Why These Choices

### 2.1 shadcn/ui + shadcn MCP (verified via `webfetch` ui.shadcn.com/docs, CLI v4 Mar 2026)
- **Architecture:** Copy-paste, not `node_modules`. `npx shadcn add button` writes `src/components/ui/button.tsx` (you own it). `cva` variants, `cn()=twMerge(clsx())`, `Slot/asChild` (Radix `Slot`). Tailwind v4 `@import "tailwindcss"` + `@theme inline` mapping CSS vars → utilities. Semantic vars `background/foreground/card/primary/muted/border/ring/chart-*` in OKLCH, `.dark` overrides.
- **Registry:** `registry.json` (`$schema: https://ui.shadcn.com/schema/registry.json`) + `registry-item.json` (`name/type/registryDependencies/dependencies/files/cssVars`). `npx shadcn build` → static `public/r/{name}.json`. Namespaced `components.json: registries: {"@bb-kit": "https://.../r/{name}.json"}`, `loadRegistry()` from `shadcn/registry` (May 2026), `shadcn registry validate` (May 2026). GitHub registries `owner/repo/item#tag` supported June 2026. Base UI is shadcn default July 2026 (unified `radix-ui` package also valid).
- **MCP:** Bundled in CLI, not separate: `pnpm dlx shadcn@latest mcp init --client opencode|claude|codex|vscode`. 7 tools (`get_project_registries`, `list/search/view_items`, `get_item_examples`, `get_add_command_for_items`, `get_audit_checklist`). Stdio only. Reads `components.json` for project-aware install. Quality depends on good `description`/`registryDependencies`.

**Implication:** Cheapest agent-installable distribution is **registry + Skill**, not npm. LLM reads local copied source directly.

### 2.2 twostraws/SwiftUI-Agent-Skill (correction: `twostraws` not `wostraws`)
- `twostraws/SwiftUI-Agent-Skill` 4.6k★, `swiftui-pro/SKILL.md` orchestrator + 9 lazy `references/*.md` (api/views/data/navigation/design/a11y/performance/swift/hygiene), token-efficient partial reviews (`/swiftui-pro Check for deprecated API`). Targets iOS 26/Swift 6.2 (`@Observable`, `@Entry`, `WebView`). Output: file:line + before/after + prioritized summary. Works with OpenCode via `.opencode/skills/swiftui-pro/SKILL.md` / `~/.config/opencode/skills` / `.claude/skills` / `.agents/skills`. Installed via `npx skills add https://github.com/twostraws/swiftui-agent-skill --skill swiftui-pro`. Review-only, not generative. Alternatives: `AvdLee` (20+ refs, Charts) for depth, `Dimillian/Skills` modular.
- **Takeaway:** Use its *pattern* (orchestrator + lazy refs) as template for `bb-kit` Skill. Keep it as `ios/` module later; don't try to make one skill cross-platform.

### 2.3 Design tokens — only shareable layer
- **Alive:** Style Dictionary v5.5.2 + W3C DTCG stable 2025-10 (`$value/$type`, `.tokens.json`), Tokens Studio (300k users) + Figma Variables bi-directional sync.
- **Dead/abandoned:** Theo, Diez (2022), Specify (sunsetting 2026 banner). Supernova = enterprise AI/MCP ($20-45/seat) — overkill for v0.
- **2026 consensus pipeline:** `Figma Variables ↔ Tokens Studio → Git DTCG JSON → Style Dictionary → {CSS vars, Tailwind @theme, Swift enums}`. Tamagui/NativeWind/Expo solve Web↔RN, not Web↔SwiftUI — share *tokens* (naming `background/foreground/...`), not components.

### 2.4 Packaging / compilation (2026)
- Registry-only kits: **no `tsup/tsdown/vite lib`**. Deliver source; consumer's bundler compiles. Only two codegens: **`style-dictionary build`** (tokens → CSS) + **`shadcn build`** (registry JSON). `tsup`/`tsdown` only when also publishing `npm i @bb-kit/react` with `dist/index.mjs + .d.ts` + `exports` map. `tsc --noEmit` suffices for typecheck in v0.

### 2.5 Visibility / docs (2026)
- **Storybook 10** (Oct 2025): ESM-only (Node 20.16+/22.19+), 65% leaner than v8 (50MB→17MB), Vite builder `@storybook/react-vite`, `addon-essentials` **removed/deprecated** (controls/viewport built-in), correct stack is `addon-a11y (axe) + addon-docs + addon-vitest` (Vitest+Playwright). MCP for React (10.3), CSF Factories `preview.meta()`. Cold start ~8s / HMR ~2s vs Ladle 1.2s/<0.5s but Ladle has no Docs/Controls/a11y — weak for review. Histoire (Vue), zeroheight/Supernova ($49-800/mo, invisible to agents). 2026 winner for minimal kits: **`registry + skill + MCP + lightweight docs`**; Storybook is the human browsing complement, not the agent source.

### 2.6 bubble-kit as foundation (read-only scan `src/*:44` files)
- `CLAUDE.md:14` composition-first, `ARCHITECTURE.md` atomic composition + `InfiniteList` capability, `STYLE.md:10` atom pattern (`const Padding = Object.assign((v)=>({padding:v}), {x1:{padding:8}})`, `Padding.x2` or `Padding(12)` escape, generate via `mapObject`).
- `styles/foundation.ts:666`: `Space` `x_2:2, x_3:3, x_5:4, x1:8, x1_5:12 … x10:80`, `Width/Height/Size`, `Padding/Margin` (4-arg shorthand), `Gap`, `Flex/Jjustify/Align`, `BorderRadiusValues x1:4→x4:16`, `FontSizeValues xs3:8 … xl7:32`, `FontWeight` `HelveticaNeue*`, `Colored`, `AbsoluteFill`, `InsetContent` etc via `mapObject`.
- `styles/colors.ts:250`: `Palette` hue_ lightness (`gray_100 #DDDEEB … purple_500 #6718CA`, `primary #4F29B7`, `muted #C4C4C6`, alpha `purple_transl_100 #1B1A432E`) → `Color` semantic (`accent`, `border`, `background.{light/dark/semiDark/accent*}`, `text.muted/accent*`).
- `components/foundation`: `Stack.tsx:19` `VStack/HStack` + `loading→Skeleton`, `Text.tsx:61` boolean API (`<Text sm accent bold tKey loading>`, `Title/Placeholder`, `Trans` i18n, `Children.toArray` filter), `Button.tsx:40` `Accent/Gradient/Link/Card/RoundButton` variants, `Card.tsx:14` `BackgroundName` booleans, `Skeleton.tsx:8` `useBreathingOpacity`, `List.tsx:40` `VList/HList` + `ListHeader` (`title/onAdd/onExpand`), `Layout.tsx:29` `VSpacer/HSpacer/VDivider`, plus `Banner/TextInput/Sheet/TabMenu/SearchField/Spinner/Checkbox/Reveal` etc.
- `hooks/useAsyncCallback.ts:8` tuple `[run, busy, error, clearError, result]`.

**Confirmed user preferences:** keep boolean `<Text sm accent bold>` API and 8px `Space` scale verbatim in web kit.

---

## 3. Decisions — Chosen vs Veered Away

| Area | Chosen for v0 | Veered away | Rationale |
|---|---|---|---|
| **Scope** | Single package at repo root (pure kit) | Monorepo `packages/web + packages/ios + apps/*` | No apps per user; monorepo adds `pnpm-workspace.yaml` with zero v0 benefit; migrate later via `mkdir + git mv`. |
| **Figma** | Hand-authored DTCG `.tokens.json` | Tokens Studio / Supernova / Figma Variables sync | Defers plugin cost/branching; keeps agent value immediate; wire sync later via same JSON. |
| **Distribution** | `registry.json` + `shadcn build` only; no JS bundler | `tsup/tsdown` npm `dist/` | Research: registry ships source; only Style Dict + shadcn build needed; `tsc --noEmit` for types. |
| **Styling** | Tailwind v4 `@import "tailwindcss"`, `@theme` (tree-shaken) + `@theme inline` only for `var(--bb-*)` aliases, OKLCH vars, `cva` + `cn()`, `Slot/asChild` | RN `ViewStyle` objects / CSS-in-JS | `STYLE.md` *pattern* survives, not RN impl; Tailwind v4 is shadcn canonical Feb 2025. |
| **Humans** | **Storybook 10** (correct: `addon-a11y + addon-docs + addon-vitest`, `@storybook/react-vite`, ESM) | Ladle alone / Histoire / zeroheight | User wants browse/review; Ladle lacks Docs/Controls/a11y; paid docs invisible to agents. |
| **Agents** | `bb-kit` Skill at `.opencode/skills/bb-kit/SKILL.md` (+symlinks to `.claude/skills`, `.agents/skills`), `AGENTS.md` always-on, `llms.txt`, `shadcn MCP` via `mcp init` | Figma MCP | 2026 consensus: repo-as-source + registry + skill ships 2-3x faster with AI. |
| **SwiftUI** | Deferred — template via `twostraws` pattern + ShadKit/SwiftCN ref | Cross-platform now | Share token *names*, not components. |
| **Codegen** | None | Locofy/Builder/Anima dumps | 15-30% cleanup, poor day-2 edits. |
| **Demo app** | None inside kit; ephemeral verify `npx create-next-app /tmp/kit-test && npx shadcn add @bb-kit/post-card` | `apps/demo` or `apps/portfolio` in kit | Pure kit boundary; feed is external portfolio repo. |

---

## 4. Recommended Foundation (scaffold target)

```
bb-kit/
├── tokens/
│   ├── primitive.tokens.json   # Space x_2→x10, Palette hex → DTCG $value/$type, --bb-* namespace
│   └── semantic.tokens.json    # background/foreground/card/primary/muted/border/ring + light/dark → oklch()
├── src/
│   ├── styles/
│   │   ├── tokens.css           # generated @layer tokens + @theme/@theme inline mappings
│   │   └── foundation-helpers.ts # adapted atoms: thin map BubbleKit API → cn/cva (NOT 1:1 ViewStyle copy)
│   ├── components/ui/
│   │   ├── button.tsx           # cva variants (default/accent/link) + Slot
│   │   ├── card.tsx
│   │   ├── text.tsx             # preserves boolean <Text sm accent bold>; resolves i18n gap (see §6)
│   │   ├── stack.tsx            # VStack/HStack
│   │   ├── skeleton.tsx         # respects prefers-reduced-motion
│   │   ├── badge.tsx            # from PillButton → Tag/Badge (filterable, aria-pressed)
│   │   ├── list.tsx             # VList/HList base (light)
│   │   ├── feed.tsx             # InfiniteList capability: loading/empty/error/sentinel
│   │   ├── post-card.tsx        # cover/title/date/tags/excerpt clamp
│   │   ├── filter-bar.tsx       # TabMenu + tag Badge row + SearchField (multi-select)
│   │   └── layout.tsx           # Spacer/Divider (consider dropping for gap — see §6)
│   ├── hooks/                   # port only as needed (useAsyncCallback etc)
│   └── lib/cn.ts
├── registry.json                # $schema, name/homepage, items[].type/registryDependencies spec-compliant
├── style-dictionary.config.js   # DTCG → css
├── .storybook/                  # Storybook 10 ESM, preview.ts, a11y + docs + vitest
├── .opencode/skills/bb-kit/
│   ├── SKILL.md                 # orchestrator + frontmatter (token-efficient, lazy refs)
│   └── references/{tokens,web,feed}.md  # keep to 2-3 refs max
├── AGENTS.md                    # always-on: semantic vars, 44px tap, list semantics, use bb-kit
├── llms.txt
├── components.json              # shadcn config: aliases, tailwind, base, registries: {"@bb-kit": ".../r/{name}.json"}
└── package.json
```

*Exact filenames are advisory — next agent may adjust after DTCG lint / Tailwind check.*

---

## 5. Initial Phases — Clear Recommendations, Room for Judgement

### Phase 0 — repo bootstrap (0.5 day)
**Do:** `pnpm init`, `tsconfig` `isolatedDeclarations:true`, `tailwindcss@^4.1 + @tailwindcss/vite`, `shadcn init --template next --base base --preset <pick one>` (Base UI is 2026 default; `radix` also valid — **judgement:** default to `base`, document choice), `style-dictionary@^4`, `@storybook/react-vite@^10` deps. `components.json` with `aliases` + `tailwind.css` + `registries: {"@bb-kit": "https://<host>/r/{name}.json"}`.
**Validate:** `pnpm build:tokens` produces `src/styles/tokens.css`; `npx shadcn registry validate ./registry.json` passes; `pnpm dlx shadcn@latest mcp init --client opencode` wiring (not hand `.mcp.json`).
**Leave open:** preset string, `base` vs `radix`, hosting (same origin as Storybook to avoid CORS is recommended).

### Phase 1 — tokens (1–1.5 days, reviewer-adjusted)
**Do:** Transcribe `Space` + `Palette→Color` into `tokens/primitive.tokens.json` + `tokens/semantic.tokens.json` with `$value/$type` (DTCG 2025-10) and `--bb-*` namespace. **Must:** one-off script converting hex → `oklch()` preserving alpha (`purple_transl_100 #1B1A432E` → `oklch(... / 0.18)`) and re-testing contrast. Emit both `tokens.css` (`@layer tokens { :root { --bb-... } }`) and mappings (`@theme inline { --color-primary: var(--bb-purple-500) }` — use `@theme` for tree-shaken vars, `inline` only for aliases; add `@source "src/components/ui/**/*.{ts,tsx}"` for content detection). Wrap in `@layer tokens, base, components, utilities`.
**Ambiguous (judgement):** keep raw `gray_250` keys vs collapse to semantic scale; dark strategy (`:root` vs `.dark` class vs `@media`); exact OKLCH values — next agent decides, keep semantic-first and single brand.
**Validate:** `bg-primary text-muted` utilities exist; `.dark` override works; `npx style-dictionary build` no warnings.

### Phase 2 — foundation helpers + primitives for feed (2–3 days, slice thin)
**Do:** Port atom ergonomics **as mapping, not literal copy**. *Recommendation* `src/styles/foundation-helpers.ts` maps `Space→Tailwind spacing (0.25rem)`, `Gap/Padding/Margin→cn() strings`, `Shadow/elevation→--shadow-*`, `Dimensions→CSS containers`, `Pressable→button[data-pressed]`; include warning comment "don't port `mapObject` ViewStyle atoms 1:1". Keep `<Text sm accent bold>` boolean affordance via wrapper over `cva` (confirmed) — but note shadcn norm is `size="sm"`; document the ergonomic choice.

**Build in priority order, each with Storybook story + registry entry (`description` + `registryDependencies` critical for MCP):**
1. `badge` (from `PillButton`), `button`+`card`+`skeleton`+`text`+`stack`
2. `feed` (InfiniteList capability: `loading/empty/error + sentinel`), `post-card` (image/title/date/tags/excerpt clamp), `filter-bar` (`TabMenu` + multi-select tag `Badge` row + `SearchField` + debounced query). Drop `Layout` spacers if `gap` suffices (judgement).

**Tag filtering (confirmed yes):** `FilterBar` controlled `value: string[]` + `onValueChange` + `query + onQueryChange` (debounced); `Feed` filters `posts: Post[]` via pure exported `filterPosts(posts, {selectedTags, query})` so external `lib/notion.ts` can reuse. `Badge` uses `aria-pressed`, `role="group"`, arrow-key roving, `focus-visible:ring`.

**i18n gap (judgement):** `Text.tsx:61` `tKey/count/values/components` relies on `react-i18next Trans`. For web kit, **recommendation:** drop `tKey` and expose plain `children`; or adopt `next-intl` — next agent picks, document in `Skill`.

**a11y+test spine (reviewer fix, not deferred):** `addon-a11y` (axe) + `@storybook/addon-vitest` + `parameters.a11y.test`, keyboard play tests for `Button/FilterBar/Badge`, `prefers-reduced-motion` for `Skeleton`.

**Validate (human):** `pnpm storybook` — browse `FilterBar` toggling 6 tags filtering `PostCard` grid with `SkeletonPostCard` + `EmptyState`.
**Validate (agent):** ephemeral `npx create-next-app /tmp/kit-test && npx shadcn add @bb-kit/post-card --dry-run --diff` renders with semantic tokens, no raw hex.

### Phase 3 — agent layer (0.5–1 day)
**Do:** `bb-kit/SKILL.md` orchestrator with frontmatter `name: bb-kit` + `description` + lazy `references/` (keep to 2–3 refs max, mirroring `shadcn/skills` installed via `npx skills add shadcn/ui`). `AGENTS.md` always-on: composition-first (`CLAUDE.md:14`), semantic vars (`bg-card` not hex), `44px` tap targets, `ul/li` feed semantics, `ContentUnavailableView` patterns. `llms.txt`, `components.json` registries. Install via `npx skills add` symlink to `.claude/skills` + `.agents/skills` for cross-client.
**Leave open:** skill granularity (one orchestrator is enough; split only if token cost merits).
**Validate:** Prompt OpenCode "add a feed with tag filtering using bb-kit" → agent correctly picks `Badge+Feed+FilterBar` with semantic colors, no raw hex, passes `npx shadcn get_audit_checklist`.

**Deferred:** npm `dist/` (`tsdown` — add later with `defineConfig({entry:['src/index.ts'], format:['esm','cjs'], dts:true, external:['react']})`), Chromatic/visual, Supernova, SwiftUI `packages/ios`.

---

## 6. Judgement Calls Explicitly Left for Builder

- **`base` vs `radix`** — recommend `base` (2026 default) but either is valid; don't block Phase 0.
- **Exact Tailwind mapping** for `Space x1_5=12` → `p-3` vs `p-[12px]`; keep `Padding(12)` escape as `p-[12px]` or inline style — document.
- **Text weight** `HelveticaNeue*` (RN) → web font stack (system/`inter`) — pick and document.
- **Card sizing** — drop `Dimensions.get('screen').width` fixed `cardSize:41`; use responsive grid + container queries.
- **FilterBar UX** — default multi-select badges + search (portfolio feed); URL sync is portfolio responsibility.
- **Storybook addons** — start `a11y + docs + vitest` only; `interactions` later if stories become tests.
- **Registry hosting** — `public/r/*.json` on same origin as Storybook vs GitHub raw `owner/repo` registries — recommend same origin.
- **i18n** — keep plain `children` vs `tKey` vs `next-intl` — decide in Phase 2.
- **File splits** — single `tokens/tokens.json` vs `primitive/semantic` — let DTCG lint decide.
- **Layout spacers** — keep `VSpacer/HSpacer/FSpacer` vs use `gap` — default to `gap`.

---

## 7. Risks & Mitigations

- **Porting RN atoms too literally** → treat `foundation-helpers.ts` as *map*, not engine; Tailwind already solves spacing — don't rebuild it.
- **Over-documenting Skill** duplicates Storybook → keep Skill token-efficient (lazy refs, `description` does the work for MCP).
- **Too many components** slows "agent value immediately" → strictly cap v0 at feed set above; `Banner/Checkbox/Sheet` etc are v1.
- **OKLCH contrast drift** after hex conversion → re-test with axe + visual check in Storybook.
- **Registry breaking rename** (e.g. `accent`→`primary`) → add `changesets` + semver note even for registry-only.

---

## 8. Next Step

This file is saved (no code yet). Next agent: execute **Phase 0 → Phase 1** verbatim, applying the 5 reviewer fixes, and open a PR with `tokens.css` + Storybook preview URL. Do not add `apps/` or Notion code to `bb-kit`.

*Saved to `./.opencode/plans/bb-kit-foundation-2026-08-30.md` and `~/.claude/plans/bb-kit-foundation-2026-08-30.md` (reviewer subagent: `ses_fabbc75f9ffewPuYFZdeGnOpN2`).*
