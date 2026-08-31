# bb-kit — Foundation Plan r4

**Date:** 2026-08-30 · **Replaces:** r3, r2.1, r1 · **Repo:** `/Users/bubbles/dev/bb-kit` (empty) · **Old kit for reference:** `../bubble-kit` (React Native)

**How to read this:** §1 and §2 are the rules everything follows. §3–§7 are what to build. §8 lists bugs not to copy. §9 is the order of work. If you read only two sections, read §2 and §9.

**Changed since r3:** the theme system was rebuilt — the old design silently failed when nested (§4.1). Storybook is back in place of a custom review app (§7). Concrete values that r3 described but never gave are now written down: line heights, radius, shadow, fonts, target sizes, disabled colors (§5). Style Dictionary is dropped (§9). The palette gained four roles and was retuned so selected filter tags are actually visible (§5.1).

---

## 1. What this is

A web UI kit. Small, well-made components that an AI agent installs and composes, and that a person checks by looking at them in a browser.

It ships three kinds of thing:

1. **Design tokens** — colors, spacing, text sizes. Plain data, reusable outside the web later.
2. **Components** — React.
3. **Logic** — hooks and plain functions any app can use.

**What it does not contain:** any actual site. No portfolio, no Notion code, no `Post` type.

**First real use:** a personal portfolio with a list of posts you can filter by tag. That site lives in its own repo and installs from this one.

---

## 2. The rules

These decide most questions that come up later. Read them before making a judgement call.

### Rule 1 — Foundation components should be simple, but smart

A component should do the obvious thing well without being configured. `<VStack>` gives you a sensible gap without asking. Composing stays easy, and the result looks right by default.

### Rule 2 — Build big things out of small exported pieces

Every larger component is assembled from smaller ones that callers can also use directly.

If someone wants a version of a component that leaves out one of its parts, they build their own from the same pieces, leaving that part out. **We do not add a way to switch parts off.** That is the rule, and it covers every part of every component — a flag to hide a header would be one example of what to avoid, but only an example.

### Rule 3 — Be careful about adding props

Before adding a prop, ask: if this prop did not exist, would the normal use of this component be wrong?

If yes, add it. If it would only be slightly more typing, don't.

Avoid props phrased as a negative (`noScroll`, `noHeader`). Avoid props that only switch a style the caller could pass in themselves. If a default needs a switch to turn it off, the default was wrong — fix the default.

There is a real example of what happens without this rule. The old `List` ([List.tsx:26](../bubble-kit/src/components/foundation/List.tsx:26)) grew to ten props including `noScroll`, `noHeader`, `hasGap` and `small`.

### Rule 4 — Prefer named components over a form-selecting prop

When a component has a few meaningful forms, ship each form as its own named component wrapping the base one. So `AccentButton`, `LinkButton`, `GhostButton` rather than one component with a prop. So `H2` and `Span` rather than a prop choosing the element.

The base component still exists and still takes the prop. **Call that prop `variant`** — the same name every other kit uses. An agent that writes `variant="ghost"` from habit should get the right thing rather than an ignored attribute. Named wrappers are what people reach for; `variant` is the escape hatch underneath.

The old kit already worked this way: `Button.tsx` exported `AccentButton`, `LinkButton`, `RoundButton`.

**Exception: size.** Size stays an ordinary prop. Named components for every size times every form multiplies out of control.

**Applies to `Surface` too:** export `PlainSurface`, `OutlinedSurface`, `RaisedSurface` alongside the base.

### Rule 5 — A new component when the shape changes, a variant when only the paint changes

- Same structure and behavior, different appearance → same component, different variant.
- Different structure or behavior → separate component.

`List` and `InfiniteList` are two components. `Surface` has three variants.

### Rule 6 — Everything is overridable from outside

Every component takes `className` and passes it through. Every internal part carries a `data-slot` marker, so a caller can restyle one part without us adding a prop for it.

### Rule 7 — No component ever names a color

Components refer to roles: page, card, text, quiet text, primary. Never a hex value, never a raw palette color. This is what makes §4 work.

---

## 3. Components

About thirty small pieces. Each is short — that is the point. (r3 said twenty; that was an undercount.)

### 3.1 Text — 7 pieces

`Text` renders a paragraph, carrying size and color role.

Alongside it, each wrapping `Text` with the element already chosen: `H1`, `H2`, `H3`, `H4`, `Span`, `Label`.

The element prop is internal. Callers pick `H2`; they do not pass an element name. Heading levels are invisible when you look at one component alone, and getting them wrong hurts search engines and screen readers on a real page.

### 3.2 Layout — 2 pieces

`VStack` stacks children downward. `HStack` lays them out sideways. Both default to an 8px gap.

**Neither takes a loading state.** The old `Stack` did ([Stack.tsx:19](../bubble-kit/src/components/foundation/Stack.tsx:19)), and it was broken: it swapped all children for a single 16px bar, so a card-sized stack collapsed to one thin line while loading and then jumped to full height. Callers place `Skeleton` elements themselves, which Rule 2 prefers anyway.

They also do not take an empty state. They accept arbitrary children, so they cannot tell "empty" from "one child that renders nothing". `List` can, because it takes data.

### 3.3 Surface, Card, List — 13 pieces

`Surface` is a plain box owning three variants: **plain**, **outlined**, **raised**. Defined once, so nothing drifts. Named wrappers per Rule 4.

Built on it:

- `Card` — a standalone box, plus `CardMedia`, `CardTitle`, `CardBody`, `CardFooter`.
- `List` — a proper list. Owns the gap, the empty state, the loading state.
- `ListItem` — one row, no decoration.
- `CardListItem` — a row using `Surface` and the card parts.
- `InfiniteList` — wraps `List`, loads more as you scroll.

`InfiniteList` is separate from `List` rather than a prop on it, per Rule 5.

A list row is only valid inside a list. That is why `Card` and `CardListItem` are separate rather than one thing. They share their variants and their parts; only the wrapper differs.

Three specifics an agent would otherwise guess at:

- **`CardTitle` renders no heading.** It is a styling slot. Put an `<H3>` inside it. A hardcoded level would be wrong half the time, defeating §3.1.
- **`Card` and `CardListItem` support `asChild`.** A card is usually a link. `asChild` lets `next/link` wrap it without adding an element. Base UI ships this. **A card containing another interactive element — a tag badge — must not be wrapped in a link.** Use a covering link over the title instead, or the badges become unclickable.
- **`List` never truncates.** The old one silently rendered only the first three items horizontally ([List.tsx:157](../bubble-kit/src/components/foundation/List.tsx:157)). And its loading state returned early, dropping the header and changing the block's height ([List.tsx:85](../bubble-kit/src/components/foundation/List.tsx:85)). The new one keeps the header and holds its height while loading.

### 3.4 The rest — 11 pieces

- `Button`, with `AccentButton`, `LinkButton`, `GhostButton`. Size stays a prop.
- `Badge` — also a toggle for tag filters. A real button with a real pressed state. **Selected means filled with the primary color**, not tinted — see §5.1.
- `Skeleton` — holds still if the reader asked for reduced motion.
- `Separator` — a real dividing line.
- `EmptyState`.
- `SearchField` — needed in v0 because `FilterBar` is built from it.
- `FilterBar` — a search field plus a row of tag badges.
- `ThemeProvider` and `useTheme` — see §4.

### 3.5 Post layouts are examples, not components

A post has a cover, title, date, tags and excerpt. That shape belongs to your site, not a UI kit — same reason §6 keeps the filtering generic.

So post layouts ship as **examples you copy and edit**. Two of them, one card-shaped and one row-shaped. Two is deliberate: it proves the pieces recombine.

**An example becomes a real component** when the same shape has held up across three separate uses without changing. Not before.

### 3.6 Not in v0

`Banner`, `Sheet`, `TabMenu`, `Spinner`, `Checkbox`, `Reveal`, and the `useAsyncCallback` hook ([useAsyncCallback.ts:8](../bubble-kit/src/hooks/useAsyncCallback.ts:8)). That hook fits the kit and will likely come next. It waits only because nothing in v0 uses it, and code with no user cannot be reviewed.

### 3.7 Which pieces run in the browser

Getting this wrong is silent — mark everything browser-only and it still works, just slower, with nothing to flag it.

**Browser only:** `ThemeProvider`, `useTheme`, `useFilteredItems`, `SearchField`, `FilterBar`, `InfiniteList`.

**Server-renderable:** `Text` and its wrappers, `VStack`, `HStack`, `Surface`, `Card` and its parts, `List`, `ListItem`, `CardListItem`, `Skeleton`, `Separator`, `EmptyState`.

**`Button` and `Badge` are server-renderable as written.** They become browser-only when a caller attaches a click handler, which happens in the caller's file, not ours. Do not mark them browser-only pre-emptively.

---

## 4. Theming

Two settings that move independently: **palette** (which colors) and **mode** (light or dark).

### 4.1 How it works — and why the obvious approach fails

The obvious approach is two attributes, `data-theme` and `data-mode`, and CSS rules matching both together. **That silently breaks.** Consider a dark page with a palette override inside it:

```html
<html data-theme="forest" data-mode="dark">
  <div data-theme="ocean">      <!-- no data-mode -->
```

The div matches no rule, because CSS attribute selectors only look at the element itself — they do not inherit. So the div sets nothing, inherits the outer values, and the override does nothing at all. No error. This was the design in r3 and it does not work.

**What to build instead:** one attribute for the palette, and the browser's own `color-scheme` for the mode.

```css
[data-theme="forest"] {
  --page:  light-dark(#E7EDEA, #0C110F);
  --card:  light-dark(#FFFFFF, #1F2623);
  /* one line per role */
}
[data-theme="clash"] { /* same roles, other values */ }

[data-mode="light"] { color-scheme: light; }
[data-mode="dark"], .dark { color-scheme: dark; }
```

`color-scheme` is an inherited property, so a bare `<div data-theme="ocean">` picks up the surrounding mode for free, and `light-dark()` reads it there. Nesting works the way §4.3 promises.

Three other benefits: half the CSS; a light island inside a dark page is just `color-scheme: light`, so no separate light selector is needed; and native scrollbars, form controls and text selection follow the mode automatically.

`light-dark()` has been in all major browsers since 2024.

### 4.2 Tailwind needs one keyword or none of this works

Tailwind v4 builds utilities like `bg-card` from tokens in a `@theme` block, and by default it resolves them at build time — copying in whatever the value was and hardcoding it. Theme switching would then do nothing, with no error anywhere.

**Use `@theme inline`:**

```css
@theme inline { --color-card: var(--card); --color-page: var(--page); /* ... */ }
```

That emits `background-color: var(--card)`, resolved in the browser, so the cascade does its job.

Two more lines that are easy to miss:

- `@source "src/components/**/*.{ts,tsx}"` — Tailwind must be told where to scan for class names when components live outside the app folder.
- If any code uses `dark:` utilities, point the variant at the attribute, not just the class:
  `@custom-variant dark (&:where([data-mode=dark], [data-mode=dark] *, .dark, .dark *));`
  Without this, `.dark` works for CSS variables but not for Tailwind's `dark:` prefix.

**Verify all three in Step 2**, before any component exists. Switch the mode and confirm a color actually changes.

### 4.3 Three ways to override, smallest reach last

1. **A whole subtree** — `theme="ocean"` on any wrapper.
2. **One value** — set a single CSS variable inline on a wrapper.
3. **One part of one component** — `className` plus the `data-slot` markers from Rule 6.

None require the component to know anything.

### 4.4 What React does — almost nothing

Colors never go into React state. A theme system built that way breaks nested overrides, breaks server rendering, and re-renders on every change. It would also force every component showing a color to run in the browser, which for a page that is mostly a list of posts is most of the performance.

**Use `next-themes` for the root provider.** It already does attribute writing, saving the choice, the before-paint script, and system-preference syncing — all fiddly, all easy to get subtly wrong. Point it at the `data-mode` attribute.

Hand-roll only the nested `<div theme="...">` wrapper, which `next-themes` does not do, and `useTheme` if `next-themes`' own hook is not enough.

**One trap to name explicitly.** The before-paint script changes attributes on `<html>` before React starts, so React reports a hydration mismatch. The fix is one prop: `<html suppressHydrationWarning>`. Say this in the code comment, because an agent that hits the warning will otherwise "fix" it by moving the theme into React state — destroying server rendering and nested overrides in the process.

### 4.5 Two palettes in v0

The default (§5.1), plus one built to clash.

The clashing palette is a test, not a product. Concretely it must be: **a warm hue around 30–40 degrees, high colorfulness, and a light-mode primary that is lighter than the page rather than darker.** That last part is the point — it catches any component assuming the primary color is the dark one. A vague "different and flipped" would produce a weak test that proves nothing.

A real second brand comes later.

### 4.6 The checks every palette must pass

One function, used by the test now and the color explorer later (§10), so the tool can never approve something the test would reject.

| Pair | Minimum |
|---|---|
| Text on page, text on card | 4.5 |
| Quiet text on page, on card, on muted surface | 4.5 |
| Text on a primary fill | 4.5 |
| Text on a highlight | 4.5 |
| Primary against page, against card | 3.0 |
| Input border against page, against card | 3.0 |
| Focus ring against page, against card | 3.0 |
| Card against page | 1.15 |
| Border against page, against card | 1.4 |
| Highlight against card | 1.15 |
| Disabled text against page | 2.0 |

Every threshold is a number. "Visibly different" is not something a function can assert.

---

## 5. Colors, spacing, type

### 5.1 The default palette — forest teal

Built from scratch. **Nothing from the old palette is carried over** — see §8.

One green hue for the brand, and a near-grey built at the same hue with a trace of color, so the greys sit with the green rather than looking bolted on. Everything written in OKLCH.

| Role | Light | Dark |
|---|---|---|
| Page | `#E7EDEA` | `#0C110F` |
| Card | `#FFFFFF` | `#1F2623` |
| Text | `#0C110F` | `#F2F6F4` |
| Quiet text | `#4F5854` | `#B8C0BD` |
| Muted surface | `#D2D9D6` | `#353D39` |
| Primary | `#03614B` | `#57BA9A` |
| Text on primary | `#FFFFFF` | `#00160F` |
| Highlight | `#B4E4D2` | `#035541` |
| Text on highlight | `#034937` | `#E1F4EC` |
| Border | `#B8C0BD` | `#424A47` |
| Input border | `#4F5854` | `#6D7773` |
| Focus ring | `#007C60` | `#57BA9A` |
| Disabled surface | `#D2D9D6` | `#353D39` |
| Disabled text | `#7F8985` | `#6D7773` |

**All eighteen checks in §4.6 pass in both modes.** Measured, not estimated.

**A selected filter tag is filled with the primary color, not the highlight.** No pale tint can reach 3:1 against the page — the highlight tops out near 1.3 before it stops looking like a tint. Since a selected tag communicates the state of a control, it needs 3:1. A primary fill gives 6.24 in light and 8.08 in dark. The highlight stays what it is good for: hover and gentle emphasis.

**How the palette was built**, so retuning is repeatable rather than guesswork:

- Brand hue 170. Lightness steps 98, 95, 90, 82, 72, 62, 52, 44, 36, 27, 18, 13. Colorfulness rises to about 0.12 in the middle and falls at both ends. Anything outside what a screen can show is pulled back until it fits.
- Grey hue also 170, colorfulness 0.003 to 0.013 — barely there, enough to relate.

`scripts/build-palette.ts` generates the ramps and prints every contrast number. The values above are its output.

### 5.2 OKLCH to write, OKLab to blend

Same color space, two ways of writing it. OKLCH gives lightness, colorfulness and hue — numbers you can reason about, which is what building a ramp needs. OKLab is the form for blending and gradients, because colors mixed that way do not drift through muddy hues.

**Write `oklch()`. Blend `in oklab`.**

### 5.3 Spacing

8px base, matching the old kit: `x1` is 8, `x1_5` is 12, `x2` is 16. These map onto Tailwind's normal spacing numbers. Tailwind already handles spacing; we are not building a second system.

### 5.4 Type

Tailwind's normal sizes, with our own line heights, which Tailwind leaves too loose at heading sizes.

| Name | Size | Line height | Used for |
|---|---|---|---|
| `xs` | 12px | 1.33 | dates, tag counts |
| `sm` | 14px | 1.43 | captions, secondary text |
| `base` | 16px | 1.5 | body — the default |
| `lg` | 18px | 1.44 | card titles |
| `xl` | 20px | 1.4 | section headings |
| `2xl` | 24px | 1.25 | page title |
| `3xl` | 30px | 1.2 | hero |

Weights: 400 normal, 500 medium, 600 semibold, 700 bold.

Font stack, no web font in v0:
`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

Using Tailwind's own sizes is the deliberately boring choice, and it is reversible: sizes are variables like colors, so a distinctive scale can arrive later as part of a theme.

### 5.5 Corners, shadows, motion, target size

**Corner radius:** base `0.5rem`, with `sm` 0.25, `lg` 0.75, `xl` 1rem derived from it.

**Shadows** are theme tokens, not utility classes, because dark mode needs different values.

| | Light | Dark |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgb(0 0 0 / 0.06)` | `0 1px 2px rgb(0 0 0 / 0.4)` |
| `shadow-sm` | `0 2px 6px rgb(0 0 0 / 0.08)` | `0 2px 6px rgb(0 0 0 / 0.5)` |
| `shadow-md` | `0 6px 16px rgb(0 0 0 / 0.10)` | `0 6px 16px rgb(0 0 0 / 0.6)` |

The raised `Surface` uses `shadow-xs`. Because the page is tinted and cards are white, the shadow is a second signal, not the only one.

**Motion:** fast 120ms, normal 200ms, easing `cubic-bezier(0.2, 0, 0, 1)`. Everything that moves is wrapped so it holds still for readers who asked for reduced motion.

**Target size:** 24px minimum for anything clickable, per WCAG 2.5.8. 44px for primary touch targets. This matters most for `Badge` used as a toggle, which is otherwise the smallest clickable thing in the kit.

**Focus outlines need their own color.** Using the primary color means a focused primary button gets an outline the same color as itself — invisible. That is why §5.1 has a separate focus ring color, checked at 3:1 against both page and card. The small gap around the outline is filled with the page color, not left to default to white, which would put a white halo around everything in dark mode. Follow shadcn's current approach, not older ring-offset patterns.

---

## 6. Filtering

The one piece of real logic. Ships on its own — no React, no dependencies — so anything can use it.

It knows nothing about posts. You tell it how to read tags and text from your own objects.

```ts
filterItems(items, criteria, accessors)              // the filtered list
collectTags(items, getTags)                          // every tag with a count
collectTagsWithSelection(items, criteria, accessors) // adds `disabled` for dead-end tags
toggleTag(selected, tag)                             // add or remove one tag
```

**Picking several tags narrows the results** — an item must have all of them. `match: 'all' | 'any'` is a field on `criteria`, defaulting to `'all'`, so a different site can flip it to widening.

Because narrowing is the default, `collectTagsWithSelection` can mark a tag that would leave you with nothing, and `FilterBar` greys it out before you click. Under widening this does almost nothing, which is worth knowing but not worth removing the function over.

Details to pin down:

- Text search ignores case and accents. Strip only Latin combining marks, so Korean, Hindi and Hebrew text is not mangled.
- Search and tag filtering combine with "and".
- Output preserves input order.
- With nothing selected, the same array comes back. That does not make React skip work by itself — it lets `useMemo` and `React.memo` skip, if the caller uses them.
- Empty text and an empty tag list both count as nothing selected.

`useFilteredItems` adds memoizing and a typing delay. **Only the filtering is delayed** — the text field stays immediately responsive, or typing feels laggy.

**The kit owns no translation system.** Callers pass strings that are already translated. The old `Text` was built around `react-i18next` ([Text.tsx:1](../bubble-kit/src/components/foundation/Text.tsx:1)); none of that comes across.

---

## 7. How you look at the components

Since an agent writes the code and you never read it, **looking at the components is the acceptance step.**

### 7.1 Storybook, not a custom app

r3 planned a custom review app. That was the wrong call, for three reasons.

Its hardest feature — controls generated from each component's own definitions — is something Storybook does out of the box. Building it means writing a parser for our own variant definitions, roughly a day, for something installable.

The reasons r3 gave for building it don't hold. "It renders in the real app with real themes" — Storybook's Next.js setup uses the real Tailwind build, real fonts, real stylesheet. And "Storybook can't do per-component theme overrides" was simply wrong: the override is a wrapper div, which in Storybook is a four-line decorator, and per §4 nesting is pure CSS that Storybook needs to know nothing about.

There was also a flaw r3 missed. A review app built from the kit means that when `Surface` breaks, the tool's own panels break too. You would sit looking at a broken frame, unsure whether the bug is in the component or the viewer.

### 7.2 What to set up

**Storybook**, with the Next.js framework, plus:

- A toolbar control for palette and mode — two dropdowns, about twenty lines, wrapping each story in the right attributes.
- **The pseudo-states addon.** This is the important one. Only one element on a page can hold keyboard focus, so a grid of buttons shows twenty resting states and no focus ring. The addon forces hover, focus, active and disabled so you can see them side by side. Without it an agent can ship a component with no focus style and nothing will reveal it.
- The accessibility addon, for labels, roles and structure.
- The viewport addon, set to 375, 768 and 1440. The first consumer is a portfolio read on phones; nothing else in the plan would surface a card that breaks at 375.

**Every interactive component gets a story showing all its states**, using the addon: normal, hover, focus, pressed, disabled.

**Shared awkward content** in one file, used by every story that shows text or lists: empty string, one character, a 200-character title, a 60-character word with no spaces, 0 / 1 / 3 / 24 tags, a missing image, a missing date. These catch overflow and clipping that tidy sample content never will.

### 7.3 Two hand-written pages in the Next app

Storybook is bad at both of these, and they are the pages you will look at most.

- **`/tokens`** — every color pair, both modes, both palettes, with its measured contrast number and a pass or fail mark. This is what you check in Step 2, before any component exists.
- **`/kitchen-sink`** — a realistic composed page: filter bar, a list of post cards, an empty state. Built from the kit, at real page width. This is the "first real user" check, as one file rather than an application.

### 7.4 Screenshots come later

Look in the browser first. Once a component settles, save reference pictures with Playwright so later changes show only what changed. Reference images of something still moving are just noise.

---

## 8. Bugs in the old kit — do not copy these

The old palette is not carried over. This is why.

1. **The grey ramp is out of order.** The file says higher numbers are darker ([colors.ts:18](../bubble-kit/src/styles/colors.ts:18)). They are not: `gray_200` is lighter than `gray_50`, and `gray_300` is lighter than both `gray_250` and `gray_100`.
2. **A color named teal is purple.** `teal_transl_100` ([colors.ts:47](../bubble-kit/src/styles/colors.ts:47)) is the primary purple at 36% transparency.
3. **Two unrelated colors differ by one underscore.** `pink500` is a real pink; `pink_500` is the purple primary ([colors.ts:64](../bubble-kit/src/styles/colors.ts:64), [colors.ts:72](../bubble-kit/src/styles/colors.ts:72)).
4. **`muted` means two different colors depending on where you look.** `#C4C4C6` at the top level, `#AEB0C4` under `text` ([colors.ts:99](../bubble-kit/src/styles/colors.ts:99), [colors.ts:156](../bubble-kit/src/styles/colors.ts:156)).
5. **Quiet text fails contrast.** `Placeholder` ([Text.tsx:55](../bubble-kit/src/components/foundation/Text.tsx:55)) uses the muted text color, which resolves through `Colored` ([foundation.ts:610](../bubble-kit/src/styles/foundation.ts:610)) to `#AEB0C4` — **2.14 against white**, where 4.5 is the minimum. No grey in that ramp passes until `gray_700`.
6. **Everything leaks into the semantic layer.** `Color` spreads the whole raw palette into itself ([colors.ts:88](../bubble-kit/src/styles/colors.ts:88)), so every raw color is also a semantic name. That is the mechanism behind the sprawl, and why raw colors stay private here (Rule 7).

**A pattern to avoid across the whole kit, not one file.** Several components take boolean style props typed as a record of every style name, then spread all remaining props onto the element. On the web that leaks invalid attributes into the DOM — things like `gray_400="true"`. It appears in `Text` ([Text.tsx:76](../bubble-kit/src/components/foundation/Text.tsx:76)), `Skeleton` ([Skeleton.tsx:8](../bubble-kit/src/components/foundation/Skeleton.tsx:8)), `Card` ([Card.tsx:15](../bubble-kit/src/components/foundation/Card/Card.tsx:15)) and `Layout` ([Layout.tsx:23](../bubble-kit/src/components/foundation/Layout.tsx:23)). Rule 4 removes most of it by turning these into named components. Where a prop remains, list the style props explicitly and destructure them.

**Never read the screen size when a file loads.** The old `Card` does ([Card.tsx:37](../bubble-kit/src/components/foundation/Card/Card.tsx:37)). On the web that crashes during server rendering and never updates on resize. An agent that hits the crash may "fix" it by marking `Card` browser-only, quietly losing the server rendering §4.4 depends on. Use CSS and container queries.

Also: the old `Card` is always pressable. The new one is a plain box unless `asChild` makes it a link (§3.3).

---

## 9. Order of work

**Roughly 12–13 days.** Storybook rather than a custom app is what keeps this from becoming 18.

### Step 0 — set up (half a day)

Start from shadcn's registry template if it still does what we expect — registry files, build, and hosting in one piece. **Check first and say in the pull request which way you went.** If it has changed, set up a plain Next.js app and host registry files on GitHub as `samerce/bb-kit/{name}`. Registry item names are public API, so use that exact format.

Install: Tailwind v4, shadcn's setup, `cva`, `clsx`, `tailwind-merge`, Base UI, `next-themes`, Vitest with Testing Library and an accessibility checker, Playwright, Storybook with the Next framework plus the pseudo-states, accessibility and viewport addons. Add a license.

**Not** `isolatedDeclarations` — it speeds up producing type files for a published package, and this kit publishes none.

**Not** Style Dictionary. It converts one token source into many platforms, which is worth it once SwiftUI is real. Today it would convert colors into CSS and nothing else, and it has no built-in Tailwind v4 output, so someone would have to write a custom formatter that emits `@theme inline` correctly. Instead: **both palettes live in one TypeScript file.** The check function imports it, the test imports it, and `scripts/build-tokens.ts` imports it and writes the CSS. That gives §4.6's single-implementation guarantee more directly than routing through JSON.

**Not** changesets — it versions npm packages, and this ships through a registry.

### Step 1 — decide and record (half a day, no code)

Write §2, §4 and §5 down as the settled contract. Look at the colors on a screen and fix anything wrong in practice. If they hold up, this is twenty minutes — which is the idea.

### Step 2 — theming and colors (1.5 days)

**Theming first, before any component.** Build the palette file, the CSS from §4.1, and the `next-themes` root provider plus the nested wrapper. Then verify the three Tailwind things in §4.2 actually work: switch the mode and confirm a color changes. If they don't, everything built afterwards is wrong and silent.

Then both palettes, the check function from §4.6, a test running it over every palette and mode, and the `/tokens` page.

### Step 3 — logic (half a day)

The filtering functions and the hook. No UI needed, so it can happen while the rest settles. Test this hardest — it is the only part with real logic, and it is plain functions, so testing is cheap.

### Step 4 — components (5–6 days)

Rough order: `Text` and its wrappers, `VStack` and `HStack`, `Surface`, `Button`, `Card` and parts, `List`, `ListItem`, `CardListItem`, `Badge`, `Skeleton`, `Separator`, `EmptyState`, `SearchField`, `FilterBar`, `InfiniteList`. Post examples last.

Each component ships with: the source, a registry entry with a real description, a story showing every form, a states story for anything interactive, and tests.

**A component is not done until it is in Storybook with its states visible.**

Build `/kitchen-sink` once `List`, `CardListItem` and `FilterBar` exist. That is where the pieces get tested against each other rather than in isolation.

### Step 5 — the agent layer (1 day)

A skill file explaining the kit, and an always-on file carrying §2's rules. Registry entries with real descriptions, since that is what an agent searching a registry reads.

Check it by asking an agent to build a filtered post list and seeing whether it picks the right pieces.

---

## 10. Later

- **A color explorer**, like coolors.co: pick a hue, sweep a ramp, watch every check pass or fail live, save it as a palette. Icing, after v0.

  Build from existing libraries, not hand-rolled color maths: `culori` for conversion and gamut handling, `apcach` if contrast-targeted generation helps, `react-colorful` for the picker. It must use the same check function from §4.6, and write palette files rather than CSS. Whatever writes files must be development-only — it is file access behind a web request.

- A real second brand palette.
- The remaining components from §3.6.
- A SwiftUI version. Only token names travel, not components. Style Dictionary earns its place at that point.

---

## 11. Things worth a second opinion

1. **The theme system (§4).** Rebuilt since r3 after the two-attribute design was found to break when nested. The new claim is that `light-dark()` plus an inherited `color-scheme` makes nesting work, keeps components server-renderable, and halves the CSS. Check it hard — a lot rests on it, and the failure mode is silent.
2. **The named-component pattern (Rule 4).** It suits people and matches the old kit. Whether it suits an agent, versus one component with a `variant` prop, is untested.
3. **About thirty small pieces.** That is a lot to build and review. Small is the point, but the number is worth challenging.
4. **The default palette (§5.1).** Every pair passes, but passing is not the same as looking good.
5. **Storybook (§7).** Reversed from r3 on a reviewer's recommendation. Worth confirming the pseudo-states and viewport addons actually cover what the custom app was going to do.
