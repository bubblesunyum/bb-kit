# bb-kit — Foundation Plan r3

**Date:** 2026-08-30 · **Replaces:** r2.1 and r1 · **Repo:** `/Users/bubbles/dev/bb-kit` (empty) · **Old kit for reference:** `../bubble-kit` (React Native)

This version came out of a long working session. It settles things the earlier plans left open, and it changes direction in a few places. Written to be read start to finish before any code is written.

**How to read this:** §1 and §2 are the rules everything else follows. §3–§7 are what to build. §8 lists bugs to avoid. §9 is the order of work. If you only read two sections, read §2 and §9.

---

## 1. What this is

A web UI kit. Small, well-made components that an AI agent installs and composes, and that a person reviews by looking at them in a browser.

It ships three kinds of thing:

1. **Design tokens** — colors, spacing, text sizes. Plain data, so they can be reused outside the web later.
2. **Components** — React components.
3. **Logic** — hooks and plain functions that any app can use.

**What it does not contain:** any actual site. No portfolio, no Notion code, no `Post` type. The one exception is the review app in §7, which exists to look at the components. It is a tool, not a product.

**First real use:** a personal portfolio with a list of posts you can filter by tag. That site lives in its own repo and installs from this one.

---

## 2. The rules

These came from the working session. They decide most questions that come up later, so read them before making a judgement call.

### Rule 1 — Foundation components should be simple, but smart

A component should do the obvious thing well without being configured. If a person writes `<VStack>`, they should get a sensible gap without asking for one.

The point is that composing things stays easy, and the result looks right by default.

### Rule 2 — Build big things out of small exported pieces

Every larger component is assembled from smaller ones that callers can also use directly.

If someone wants a version of a component that leaves out one of its parts, they build their own from the same pieces, leaving that part out. We do not add a way to switch parts off.

*(That last sentence is the rule. A flag to hide a header would be one example of what to avoid, but it is only an example — the rule covers every part of every component.)*

### Rule 3 — Be careful about adding props

Before adding a prop, ask: if this prop did not exist, would the normal use of this component be wrong?

If yes, add it. If it would only be slightly more typing, don't.

Two things to avoid:

- Props phrased as a negative, like `noScroll` or `noHeader`.
- A prop that only switches a style the caller could pass in themselves.

If a default needs a switch to turn it off, the default was wrong. Fix the default.

There is a real example of what happens without this rule in the old kit. `List` ([List.tsx:26](../bubble-kit/src/components/foundation/List.tsx:26)) grew to ten props including `noScroll`, `noHeader`, `hasGap` and `small`. It got that way honestly — refactoring it would have touched too much code — but it is what we are avoiding here.

### Rule 4 — Prefer named components over a "type" prop

When a component has a few meaningful forms, ship each form as its own named component that wraps the base one.

So instead of one component with a prop selecting between forms, export `AccentButton`, `LinkButton`, `GhostButton`. Instead of a prop choosing the HTML element, export `H2` and `Span`.

The base component still exists and still takes the prop. It is just not the thing people reach for. Where the prop is written out, call it `look`, not `variant` — shorter, and you can picture it.

The old kit already worked this way: `Button.tsx` exported `AccentButton`, `LinkButton`, `RoundButton` and so on. This is a return to that.

**One exception: size.** Size stays an ordinary prop. Named components for every size, times every form, multiplies out of control.

### Rule 5 — A new component when the shape changes, a `look` when only the paint changes

- Same structure, same behavior, different appearance → same component, different `look`.
- Different structure or different behavior → a separate component.

So `List` and `InfiniteList` are two components, because one loads more as you scroll. `Surface` has three looks, because it is one box painted three ways.

### Rule 6 — Everything is overridable from outside

Every component takes `className` and passes it through. Every internal part carries a slot marker, so a caller can reach in and restyle a specific part without us adding a prop for it.

### Rule 7 — No component ever names a color

Components refer to roles: page, card, text, quiet text, primary. Never to a hex value, and never to a raw color from the palette. This is what makes the theme system in §4 work.

---

## 3. Components

Roughly twenty small pieces. Each one is short. That is the point.

### 3.1 Text

`Text` renders a paragraph. It carries the size and the color role.

Exported alongside it, each wrapping `Text` with the element already chosen: `H1`, `H2`, `H3`, `H4`, `Span`, `Label`.

The element prop is internal — callers pick `H2`, they do not pass an element name. This matters because getting heading levels wrong is invisible when you look at a component on its own, and it hurts both search engines and screen readers on a real page.

### 3.2 Layout

`VStack` stacks children downward. `HStack` lays them out sideways.

Both default to an 8px gap, and both accept a loading state that swaps the contents for a skeleton — the same one thing the old `Stack` did ([Stack.tsx:19](../bubble-kit/src/components/foundation/Stack.tsx:19)).

They do not get an empty state. They take arbitrary children, so they cannot reliably tell "empty" from "one child that happens to render nothing". `List` can, because it takes data.

### 3.3 Surface, Card, List

`Surface` is a plain box that owns the look: **plain** (nothing), **outlined** (a thin border), **elevated** (white with a soft shadow). All three looks are defined once, here, so nothing can drift.

Built on it:

- `Card` — a standalone box. Uses `Surface`, plus parts: `CardMedia`, `CardTitle`, `CardBody`, `CardFooter`.
- `List` — a proper list. Handles the gap between rows, the empty state, and the loading state.
- `ListItem` — one row, no decoration.
- `CardListItem` — a row that uses `Surface` and the card parts. This is a card inside a list, with correct list markup.
- `InfiniteList` — wraps `List` and loads more as you scroll.

`InfiniteList` is separate from `List` rather than a prop on it, per Rule 5.

A note on markup: a list row is only valid inside a list. That is why `Card` and `CardListItem` are separate things rather than one component. They share their looks and their parts, they differ only in the wrapper.

### 3.4 The rest

- `Button` — with `AccentButton`, `LinkButton`, `GhostButton` alongside it. Size stays a prop.
- `Badge` — also used as a toggle, for tag filters. Real button, real pressed state.
- `Skeleton` — the loading shimmer. Holds still if the reader has asked for reduced motion.
- `Separator` — a real dividing line, marked up as one.
- `EmptyState` — shown when there is nothing to display.
- `SearchField` — a text input for searching. Needed in v0 because `FilterBar` is built from it.
- `FilterBar` — a search field plus a row of tag badges.
- `ThemeProvider` — see §4.

### 3.5 Post layouts are examples, not components

A post has a cover, a title, a date, tags and an excerpt. That is a shape belonging to your site, not to a UI kit — the same reason §6 keeps the filtering logic generic.

So the post layouts ship as **examples you copy and edit**, built from the pieces above. Two of them: one card-shaped, one row-shaped. Having two is deliberate — it proves the pieces really do recombine.

**When an example becomes a real component:** when the same shape has held up across three separate uses without changing. Not before.

### 3.6 What is not in v0

`Banner`, `Sheet`, `TabMenu`, `Spinner`, `Checkbox`, `Reveal`, and the `useAsyncCallback` hook ([useAsyncCallback.ts:8](../bubble-kit/src/hooks/useAsyncCallback.ts:8)). That hook is a good fit for the kit and will likely come next. It waits only because nothing in v0 uses it, and code with no user cannot be reviewed.

---

## 4. Theming

This is a bigger deal than the earlier plans allowed for. Both of them listed multiple themes as out of scope. That was wrong: with CSS variables it is nearly free if designed in now, and awkward to add later.

### 4.1 Two settings, independent

- **Palette** — which set of colors.
- **Mode** — light or dark.

Either changes without the other. In the HTML they are two attributes: `data-theme` and `data-mode`. `.dark` also works, as a spare name for dark mode, so stock shadcn components dropped in still behave.

### 4.2 CSS does the work, React does almost nothing

Setting `data-theme` on any element retimes everything inside it. Nested, instantly, no re-render. That is a plain CSS feature and it is the whole payoff.

So React handles only four things:

1. Turning a `theme` prop into the `data-theme` attribute.
2. Remembering the reader's choice.
3. A small script that runs before the page paints, so the page never flashes the wrong theme.
4. A `useTheme()` hook for reading and changing the current setting.

**Colors never go into React state.** A theme system built that way would break nested overrides, break server rendering, and re-render the page on every change. It would be worse in every way than the CSS that already works.

There is a second reason. If theming lived in React state, every component that shows a color would have to run in the browser. With attributes, they can render on the server. For a site whose main page is a list of posts, that difference is most of the performance.

### 4.3 Three ways to override, in order of reach

1. **A whole subtree** — put `theme="ocean"` on any wrapper.
2. **One value** — set a single CSS variable inline on a wrapper, leaving everything else alone.
3. **One part of one component** — use `className` and the slot markers from Rule 6.

None of these need the component to know anything.

### 4.4 Two palettes in v0

The default (§5) plus a second one chosen to clash — a different hue family, and light and dark relationships flipped.

The clashing palette is a test, not a product. If any component has a color baked into it, or assumes the primary color is dark, it will be obvious the moment you switch. With only one palette, nobody would ever find out.

A real alternate brand comes later, once you want one.

### 4.5 Every palette must pass the same checks

Written as a single function, used in two places: the automated test, and later the color explorer (§10). One implementation, so the tool cannot ever approve something the test would reject.

The checks, for every palette in both modes:

| Pair | Minimum |
|---|---|
| Main text on page, and on card | 4.5 |
| Quiet text on page, and on card | 4.5 |
| Text on a primary button | 4.5 |
| Text on a highlight | 4.5 |
| Primary against the page | 3.0 |
| Input border against a card | 3.0 |
| Card against the page | must be visibly different |

---

## 5. Colors, spacing, text

### 5.1 The default palette: forest teal

Built from scratch. **Nothing from the old kit's palette is carried over** — see §8 for why.

One green hue for the brand, and a near-grey built at the same hue with a trace of color in it, so the greys sit with the green instead of looking bolted on. Everything written in OKLCH.

| Role | Light | Dark |
|---|---|---|
| Page | `#E7EDEA` soft sage | `#0C110F` near-black green |
| Card | `#FFFFFF` | `#1F2623` |
| Main text | `#0C110F` | `#F2F6F4` |
| Quiet text | `#4F5854` | `#B8C0BD` |
| Primary | `#03614B` deep forest | `#57BA9A` soft mint |
| Text on primary | `#FFFFFF` | `#00160F` |
| Highlight | `#E1F4EC` | `#034937` |
| Text on highlight | `#034937` | `#E1F4EC` |
| Border | `#D2D9D6` | `#353D39` |
| Input border | `#4F5854` | `#6D7773` |

Every pair passes §4.5 in both modes. Checked, not estimated.

Two notes for whoever builds this:

- The input border came out darker than it needs to be. It is safe, just heavy-looking. Worth softening once you can see it on a real page — anything above 3.0 is fine.
- The page is tinted and cards are white, so cards separate from the page on their own. A soft shadow is a second signal, not the only one. Every palette has to solve this somehow; this is just how the default does it.

The underlying ramps and the script that produced them go in `scripts/`, so retuning is repeatable rather than guesswork.

### 5.2 Colors are written in OKLCH, blended in OKLab

Same color space, two ways of writing it. OKLCH gives you lightness, colorfulness and hue — numbers you can actually reason about, which is what you need to build a ramp. OKLab is the form to use for blending and gradients, because colors mixed that way don't drift through muddy hues in between.

So: **write `oklch()`, blend `in oklab`.**

### 5.3 Spacing

8px base, matching the old kit. `x1` is 8px, `x1_5` is 12, `x2` is 16, and so on. These map onto Tailwind's normal spacing numbers. Tailwind already handles spacing — we are not building a second system for it.

### 5.4 Text sizes

Use Tailwind's normal sizes. Set our own line heights on top, since Tailwind's get too loose at heading sizes.

This is deliberately the boring choice, and it is reversible. Text sizes are variables like colors are, so a distinctive type scale can arrive later as part of a theme. Choosing something custom now would mean `text-xl` quietly means something different here than everywhere else, which would confuse both people and agents.

Line heights do have to be set now, whichever sizes are used.

### 5.5 Four details that are easy to get wrong

**Light has to be a named setting, not just "the absence of dark."** If light colors are only defined as the page default, then a light panel placed inside a dark page has nothing telling it to be light, and it comes out dark. Since the review app shows light and dark side by side on one page (§7), this would break immediately. Define light under both the page default *and* an explicit light name.

**Focus outlines need their own color.** Using the primary color for the outline means a focused primary button gets an outline the same color as itself — invisible. The outline color must be picked to stand out against whatever it sits on, and the small gap around it must be filled with the page color, not left to default to white, or dark mode gets a white halo. Follow the current shadcn approach here rather than older patterns.

**Say which components run in the browser.** Most should not. `ThemeProvider`, `FilterBar`, `SearchField`, `InfiniteList` and the filtering hook need the browser. `Text`, `Surface`, `Card`, `List`, `ListItem`, `Badge`, `Skeleton`, `Separator` and `EmptyState` should not, so they can render on the server. Mark each one explicitly. Getting this wrong is silent: mark everything as browser-only and it still works, it is just slower in a way nothing will flag.

**Automated accessibility checks cannot check contrast.** The usual test-runner tool has no real layout, so it skips contrast entirely. It is still worth running for labels, roles and structure. Actual contrast checking needs either the number-based test from §4.5, or a real browser via Playwright against the review app. Do not assume the test runner covers it.

---

## 6. Filtering

The one piece of real logic in the kit. It ships on its own, with no React and no dependencies, so anything can use it.

It knows nothing about posts. You tell it how to read tags and text off your own objects.

```ts
filterItems(items, criteria, accessors)   // the filtered list
collectTags(items, getTags)               // every tag with a count, for building a filter bar
toggleTag(selected, tag)                  // add or remove one tag
```

**Picking several tags narrows the results** — an item must have all of them. That is a setting, so a different site can flip it to widening if that suits better.

Because narrowing is the default, a tag that would leave you with nothing can be greyed out before you click it. That is genuinely useful here. It would have been dead weight under the widening behavior, which is what the earlier plan defaulted to.

A `useFilteredItems` hook ships alongside it, adding memoization and a debounce on typing.

Details to pin down while building: text search ignores case and accents; searching and tag filtering combine with "and"; with nothing selected, the original array comes back unchanged, so React can skip re-rendering. Empty text and an empty tag list both count as nothing selected.

---

## 7. The review app

Since an agent writes the code and you never read it, **looking at the components is the only way you check the work**. That makes this app the acceptance step, not documentation.

### 7.1 It looks like Storybook

Deliberately. Sidebar on the left listing every component, grouped. Click one, see just that. No new ideas about layout — copy what works.

Two controls at the top switch palette and mode for everything. Each component page has its own pair of switches that override the global ones — which also happens to be the theme system's nested override, on display.

### 7.2 Each component page has two parts

1. **Every form at once**, in a grid. You scan it, you don't click.
2. **One live example with controls**, for trying particular combinations.

The controls are generated from the component's own definitions, so a new form shows up on its own. Hand-written controls would eventually stop matching the component, and that is not something you can catch by looking.

### 7.3 It is built from the kit

Its own sidebar, buttons and panels use the kit's components. That makes it the kit's first real user, which is the fastest way to find out what is missing.

**So build the components the app needs first.** Do not spend time on throwaway plain-HTML scaffolding — let the app's needs drive which components get built, in what order. Enough shell to render one component page, then grow both together.

### 7.4 Screenshots come later

Look at things in the browser first. Once a component settles, save reference pictures so later changes show only what actually changed. Not before — reference images of something still moving are just noise.

---

## 8. Bugs in the old kit — do not copy these

The old palette is not being carried over. This is why.

1. **The grey ramp is out of order.** The file says higher numbers are darker ([colors.ts:17](../bubble-kit/src/styles/colors.ts:17)). They are not: `gray_200` is lighter than `gray_50`, and `gray_300` is lighter than both `gray_250` and `gray_100`.
2. **A color named teal is purple.** `teal_transl_100` ([colors.ts:47](../bubble-kit/src/styles/colors.ts:47)) is the primary purple at 36% transparency.
3. **Two unrelated colors differ by one underscore.** `pink500` is a real pink; `pink_500` is the purple primary ([colors.ts:64](../bubble-kit/src/styles/colors.ts:64), [colors.ts:72](../bubble-kit/src/styles/colors.ts:72)).
4. **`muted` means two different colors depending on where you look.** At the top level it is `#C4C4C6`; under `text` it is `#AEB0C4` ([colors.ts:99](../bubble-kit/src/styles/colors.ts:99), [colors.ts:156](../bubble-kit/src/styles/colors.ts:156)).
5. **Quiet text fails contrast.** `Placeholder` ([Text.tsx:55](../bubble-kit/src/components/foundation/Text.tsx:55)) uses the muted text color, which resolves through `Colored` ([foundation.ts:610](../bubble-kit/src/styles/foundation.ts:610)) to `#AEB0C4` — **2.14 against white**, where 4.5 is the minimum. No grey in that ramp passes until `gray_700`.

   *(Correcting the r2 plan: it named the wrong color and the wrong number here — `#C4C4C6` at 1.74. The failure is real either way, but the r2 text would send someone to the wrong place.)*

6. **Everything leaks into the semantic layer.** `Color` spreads the whole raw palette into itself ([colors.ts:88](../bubble-kit/src/styles/colors.ts:88)), so every raw color is also a semantic name. That is the mechanism behind the sprawl, and it is why raw colors stay private here (Rule 7).

**Also do not copy the text component's prop handling.** It loops over every prop looking for style names ([Text.tsx:76](../bubble-kit/src/components/foundation/Text.tsx:76)). On the web that would swallow real HTML attributes. List the style props explicitly instead.

---

## 9. Order of work

**Roughly 12–13 days.** Bigger than earlier drafts, mostly because of the theme system and the review app. Both were chosen deliberately.

### Step 0 — set up (half a day)

Start from shadcn's registry template if it still does what we expect — it handles registry files, the build, and hosting the app in one piece. **Check this first and say in the pull request which way you went.** If it has changed, set up a plain Next.js app and host the registry files on GitHub instead.

Install: Tailwind v4, shadcn's setup, Style Dictionary, Vitest with Testing Library and an accessibility checker, Playwright, `cva`, `clsx`, `tailwind-merge`, Base UI, changesets. Add a license.

**Not** `isolatedDeclarations`. It exists to speed up producing type files for a published package, and this kit does not publish one.

### Step 1 — decide and record (half a day, no code)

Write down §2, §4 and §5 as the settled contract. Look at the colors on a screen and adjust anything that is wrong in practice. If they hold up, this step is twenty minutes — which is the idea.

### Step 2 — colors and tokens (1 day)

Both palettes as plain token files, converted into CSS variables by Style Dictionary. Write the checking function from §4.5 once, and a test that runs it over every palette and mode. Build the page that shows every color pair with its number.

### Step 3 — logic (half a day)

The filtering functions and the hook. No UI needed, so this can happen while the rest is still settling. Test this part hardest — it is the only part with real logic, and it is plain functions, so it is cheap to test.

### Step 4 — components and the review app together (5–6 days)

Not in sequence. Build enough of the app to show one component, then build components, letting the app's own needs decide the order. The app's sidebar and panels should end up using the kit.

Rough order: `Text` and its named wrappers, `VStack`/`HStack`, `Surface`, `Button`, then whatever the app needs next. `List`, `ListItem`, `CardListItem`, `Card`, `Badge`, `Skeleton`, `Separator`, `EmptyState`. Then `SearchField`, `FilterBar`, `InfiniteList`, `ThemeProvider`. Post examples last.

**A component is not done until it appears in the review app.**

### Step 5 — the agent layer (1 day)

A skill file explaining the kit, plus an always-on file with the rules from §2. Registry entries with real descriptions, since that is what an agent searching the registry actually reads.

Check it works by asking an agent to build a filtered post list and seeing whether it picks the right pieces.

---

## 10. Later

- **A color explorer**, like coolors.co: pick a hue, sweep a ramp, see every contrast check pass or fail live, save it as a new palette. Icing — after v0.

  Build it from existing libraries rather than hand-rolled color maths. `culori` for conversion and gamut handling, `apcach` if contrast-targeted generation helps, `react-colorful` for the picker. It must use the same checking function from §4.5, and it must write token files rather than CSS. Whatever writes files has to be development-only, since it is file access behind a web request.

- A real second brand palette.
- The remaining components from §3.6.
- A SwiftUI version. Only the token names travel, not the components.

---

## 11. Things worth a second opinion

Flagged for the reviewer, and for anyone picking this up later.

1. **The theme system (§4).** The claim is that CSS variables do all the work and React only sets attributes, which keeps components renderable on the server and makes nested overrides free. Worth checking hard, since a lot is built on it.

2. **Whether the review app is worth building at all (§7).** It started as a few simple pages, which is why dropping Storybook looked cheap. It now has a sidebar, grouped navigation, theme switches and generated controls — most of what Storybook already does. The original reason for dropping Storybook was maintenance cost, and that reason is weaker now. Two things still favor building it: it renders inside the real app with the real themes, and Storybook has no concept of a per-component theme override. But that is a judgement, not a fact.

3. **The named-component pattern (Rule 4).** It suits people, and it matches the old kit. Whether it suits an agent searching a registry, versus one component with a prop, is untested.

4. **The component count.** Around twenty small pieces is a lot to build and review. The pieces are small on purpose, but the number is worth challenging.

5. **The default palette (§5.1).** Every pair passes, but passing is not the same as looking good.
