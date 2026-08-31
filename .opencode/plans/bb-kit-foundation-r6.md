# bb-kit — Foundation Plan r6

**Date:** 2026-08-30 · **Replaces:** r5 and everything before it · **Repo:** `/Users/bubbles/dev/bb-kit` (empty) · **Old kit for reference:** `../bubble-kit` (React Native)

**How to read this:** §1 and §2 are the rules everything follows. §3–§7 are what to build. §8 lists bugs not to copy. §9 is the order of work. If you read only two sections, read §2 and §9.

**Changed since r5:** restored the Tailwind rule that makes dropped-in shadcn components work (§4.2). Fixed a color pair that actually failed (§5.1). Gave the clashing palette a dark mode (§4.5). Turned §3.5 from a variant list into a full prop table. Made the mode default robust rather than order-dependent (§4.1). Restored the card-against-page check (§4.6). Added tests that enforce the two rules the design rests on (§9). Split `Theme` in two. Renamed `outlined` to `outline`. Dropped Base UI.

**Changed in r5 (kept for history):** the clashing palette was impossible as written and is respecified (§4.5). The mode setting now has a default, so "no mode" follows the reader's system rather than silently meaning light (§4.1). Tailwind's `dark:` prefix is banned inside the kit, because it reintroduced the nesting bug §4.1 exists to fix (§4.2). Variant names, values and defaults are written down (§3.5). Shadows were using a mechanism that only accepts colors (§5.5). `InfiniteList` is deferred. Registry setup is now an actual step and gets tested (§9). About twenty smaller corrections throughout.

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

**Where the line is.** Props describing *state* are fine — loading, empty, selected, disabled. Props that add or remove a structural part are not. So `List` taking a loading state is right; `List` taking a flag to drop its header would not be.

### Rule 3 — Be careful about adding props

Before adding a prop, ask: if this prop did not exist, would the normal use of this component be wrong?

If yes, add it. If it would only be slightly more typing, don't.

Avoid props phrased as a negative (`noScroll`, `noHeader`). Avoid props that only switch a style the caller could pass in themselves. If a default needs a switch to turn it off, the default was wrong — fix the default.

Rule 4's `variant` prop is the one deliberate exception to "no prop that only switches a style."

There is a real example of what happens without this rule. The old `List` ([List.tsx:26](../bubble-kit/src/components/foundation/List.tsx:26)) grew to eleven props including `noScroll`, `noHeader`, `hasGap` and `small`.

### Rule 4 — Prefer named components over a form-selecting prop

When a component has a few meaningful forms, ship each form as its own named component wrapping the base one. So `PrimaryButton`, `LinkButton`, `GhostButton` rather than one component with a prop. So `H2` and `Span` rather than a prop choosing the element.

The base component still exists and still takes the prop. **Call that prop `variant`** — the same name every other kit uses. An agent that writes `variant="ghost"` from habit should get the right thing rather than an ignored attribute. Named wrappers are what people reach for; `variant` is the escape hatch underneath. **Every allowed value and default is written down in §3.8** — an undocumented variant prop would be worse than none.

**In development, warn on unknown props.** A component that receives `variant="soft"` when it has no such value should say so in the console. Otherwise a wrong guess lands as an ignored HTML attribute and looks like it worked.

The old kit already worked this way: `Button.tsx` exported `AccentButton`, `LinkButton`, `RoundButton`. The one rename: `AccentButton` becomes `PrimaryButton`, because "accent" is now the name of a *color* role and having both would confuse.

**Exception: size.** Size stays an ordinary prop. Named components for every size times every form multiplies out of control.

### Rule 5 — A new component when the shape changes, a variant when only the paint changes

- Same structure and behavior, different appearance → same component, different variant.
- Different structure or behavior → separate component.

A list and a list that loads more on scroll are two components, not one with a flag. `Surface` has three variants.

### Rule 6 — Everything is overridable from outside

Every component takes `className` and passes it through. Every internal part carries a `data-slot` marker, so a caller can restyle one part without us adding a prop for it.

**Merge, don't concatenate.** Every component combines its own classes with the caller's using `cn()` — `clsx` plus `tailwind-merge` — with the caller's last. Without merging, both classes land in the list and CSS specificity rather than order decides the winner, so `className="bg-white"` can silently lose to the component's own background.

### Rule 7 — No component ever names a color

Components refer to roles: page, card, text, quiet text, primary. Never a hex value, never a raw palette color. This is what makes §4 work.

---

## 3. Components

About 35 exports. That number is less alarming than it looks: roughly a third are three-line named wrappers (`H2`, `PrimaryButton`, `CardListItem`), and another handful are card parts that are a `div` with a class. Counting only things with real logic, it is closer to fifteen. Each piece is short — that is the point.

### 3.1 Text

`Text` renders a paragraph, carrying size and color role.

Alongside it, each wrapping `Text` with the element already chosen: `H1`, `H2`, `H3`, `H4`, `Span`, `Label`.

The element prop is internal. Callers pick `H2`; they do not pass an element name. Heading levels are invisible when you look at one component alone, and getting them wrong hurts search engines and screen readers on a real page.

**Level and size are separate.** `H2` picks the element, not the size — it has a sensible default size, and `size` still works, so the semantically correct level never forces a look you don't want.

**`Text` has no `loading` prop.** The old one did, and it sized the skeleton to the *font size* rather than the line height ([Text.tsx:98](../bubble-kit/src/components/foundation/Text.tsx:98)), so a loading paragraph was shorter than the text it replaced and the page jumped. Callers place `Skeleton` themselves.

**`Label` renders a real `<label>`** and forwards `htmlFor`. If that feels like it belongs with form components rather than text, rename it — but do not ship something called `Label` that is only styled text.

### 3.2 Layout

`VStack` stacks children downward. `HStack` lays them out sideways. Both default to an 8px gap.

**Neither takes a loading state.** The old `Stack` did ([Stack.tsx:19](../bubble-kit/src/components/foundation/Stack.tsx:19)), and it was broken: it swapped all children for a single 16px bar, so a card-sized stack collapsed to one thin line while loading and then jumped to full height. Callers place `Skeleton` elements themselves, which Rule 2 prefers anyway.

They also do not take an empty state. They accept arbitrary children, so they cannot tell "empty" from "one child that renders nothing". `List` can, because it takes data.

### 3.3 Surface, Card, List

`Surface` is a plain box owning three variants: **plain**, **outline**, **raised**. Defined once, so nothing drifts. Named wrappers per Rule 4.

Built on it:

- `Card` — a standalone box, plus `CardMedia`, `CardTitle`, `CardBody`, `CardFooter`.
- `List` — a proper list. Owns the gap, the empty state, the loading state.
- `ListItem` — one row, no decoration.
- `CardListItem` — a row using `Surface` and the card parts.
- `CardLink` — makes a whole card clickable without wrapping it in a link. See below.
- `Page` — sets the page background and text color. Nothing else does, and without it a card floats on a white void. **`Page` is a `div`, so the real `<body>` behind it is still browser-default white** — visible on rubber-band scroll and behind any short page. So the `Page` registry entry ships a two-line snippet for the consumer's `layout.tsx`: `<html suppressHydrationWarning>` and `<body className="bg-page text-text">`. That snippet covers §4.4's hydration note as well.

**When to reach for which:** `Surface` is a box with no meaning. `Card` is a standalone box with content parts. `ListItem` is a row inside a list. `CardListItem` is a row that looks like a card. If it is inside a `List`, use a `ListItem` form; otherwise use `Card`.

`InfiniteList` is **deferred** — see §3.7.

A list row is only valid inside a list. That is why `Card` and `CardListItem` are separate rather than one thing. They share their variants and their parts; only the wrapper differs.

Three specifics an agent would otherwise guess at:

- **`CardTitle` renders no heading.** It is a styling slot. Put an `<H3>` inside it. A hardcoded level would be wrong half the time, defeating §3.1.
- **Linking a card: use `CardLink`, not `asChild`.** A card is usually a link, and `asChild` (wrapping the whole card in an anchor) is the obvious move. It is wrong whenever the card contains anything else clickable — a tag badge — because you cannot nest interactive elements. Since every post card has tags, that is the normal case, not the edge case.

  `CardLink` handles it: the card gets `position: relative`, the link inside gets a pseudo-element covering the card, and anything else interactive sits above it. The card is fully clickable, the badges still work, and there is one link in the accessibility tree, not one per card element.

  `asChild` still exists on `Card` for cards with nothing else clickable inside. The post examples in §3.6 use `CardLink`, so the right pattern is the one people copy.

  Two things about the technique worth writing down. `Card` is what sets `position: relative`, not `CardLink` — putting it on `CardLink` would make the overlay cover only the link. And text inside a stretched-link card cannot be selected, because the overlay sits on top. That is the accepted cost, not a bug to be fixed later.

  The accessibility addon's nested-interactive check will catch a wrongly nested link — but only in a story that does the wrong thing, and nobody writes those. It guards against regressions, it does not enforce the rule. What enforces it is the post examples using `CardLink`, so the right pattern is the one people copy.
- **`List` never truncates.** The old one silently rendered only the first three items horizontally ([List.tsx:164](../bubble-kit/src/components/foundation/List.tsx:164)). And its loading state returned early, dropping the header and changing the block's height ([List.tsx:86](../bubble-kit/src/components/foundation/List.tsx:86)). The new one keeps the header and holds its height while loading.

### 3.4 The rest

- `Button`, with `PrimaryButton`, `GhostButton`, `LinkButton`, `DangerButton`. Size stays a prop.
- `Badge` — also a toggle for tag filters. A real button with a real pressed state. **Selected means filled with the primary color**, not tinted — see §5.1.
- `Skeleton` — holds still if the reader asked for reduced motion.
- `Separator` — a real dividing line.
- `EmptyState`.
- `SearchField` — needed in v0 because `FilterBar` is built from it.
- `FilterBar` — a search field plus a row of tag badges.
- `ThemeProvider` — the root provider, one per app. Wraps `next-themes`, runs the before-paint script, remembers the reader's choice. Runs in the browser.
- `Theme` — the nested wrapper that sets palette or mode on a subtree. A div with two data attributes and a background. **No JavaScript at all**, so it renders on the server. Keeping these separate is the same reasoning as splitting the hooks below: one name doing two jobs means an agent guesses which, and the natural guess (React context) drags the whole subtree into the browser for nothing.
- `usePalette` and `useMode` — two hooks, deliberately not one called `useTheme`, because `next-themes` already exports a `useTheme` meaning the mode. Two hooks with the same name and different meanings, in a plan that tells the agent to use `next-themes`, would be a guaranteed mix-up.

### 3.5 Every prop, value and default

Without this table an agent invents public API. These strings cannot be changed later without breaking consumers.

**Variants**

| Component | `variant` values | Default | Named wrappers |
|---|---|---|---|
| `Button` | `primary` · `ghost` · `link` · `danger` | `primary` | `PrimaryButton` · `GhostButton` · `LinkButton` · `DangerButton` |
| `Surface` | `plain` · `outline` · `raised` | `plain` | `OutlineSurface` · `RaisedSurface` |
| `Badge` | `outline` · `filled` | `outline` | — |
| `Card` | inherits `Surface`'s | `raised` | — |
| `ListItem` | inherits `Surface`'s | `plain` | `CardListItem` (= `variant="raised"`) |

`outline`, not `outlined` — that is the word shadcn uses, so it is the word an agent types from habit, which is the whole point of Rule 4. For the same reason, `variant="default"` is accepted as a silent alias for `primary` rather than warned about.

There is no `PlainSurface`: it would be a wrapper around the default, so `<Surface>` already is it. And `CardListItem` is a named wrapper, not a separate component — it is `ListItem` with the raised variant. Two ways to say one thing is exactly what this table exists to prevent.

**Sizes.** `Button`, `Badge` and `SearchField` take `size`: `sm` · `md` · `lg`, default `md`. Heights 32 / 40 / 48px, all clearing the 24px minimum in §5.5.

**Text**

| Prop | Values | Default |
|---|---|---|
| `size` | `xs` · `sm` · `base` · `lg` · `xl` · `2xl` · `3xl` | `base` |
| `tone` | `default` · `quiet` · `primary` · `danger` · `on-primary` · `on-danger` | `default` |
| `weight` | `normal` · `medium` · `semibold` · `bold` | `normal` |
| `align` | `start` · `center` · `end` | `start` |

The colour prop is called **`tone`**, not `color` — `color` is a real HTML attribute and would collide. Values name roles from §5.1, not colours.

Heading wrappers set a default size and nothing else; `size` still overrides. `H1` → `3xl`, `H2` → `2xl`, `H3` → `xl`, `H4` → `lg`.

**Everything else**

| Component | Props |
|---|---|
| `List` | `items` · `renderItem(item, index)` · `getKey` · `loading` · `error` · `empty` (a node) · `header` (a node) · `gap` |
| `ListItem` | `variant` · `asChild` |
| `Badge` | `variant` · `size` · `selected` · `onSelectedChange(next: boolean)` · `disabled` |
| `FilterBar` | `tags` (all available) · `selected` · `onSelectedChange` · `query` · `onQueryChange` |
| `SearchField` | `value` · `onValueChange` · `placeholder` · `size` · `disabled` |
| `EmptyState` | `title` · `description` · `action` (a node) · `icon` (a node) |
| `Skeleton` | `lines` · `width` · `height` |
| `Separator` | `orientation`: `horizontal` · `vertical`, default `horizontal` |
| `CardLink` | `href` · `asChild` — `Card` sets `position: relative`, `CardLink` covers it |
| `Page` | children only; sets page background, text colour, min height |
| `Theme` | `palette` · `mode` — either may be omitted and is then inherited |
| `VStack` / `HStack` | `gap` · `align` · `justify` |

`List` renders `error` before `loading`, `loading` before `empty`, and `empty` only when `items` is empty. `renderItem` returns the *contents* of a row, not the row element — `List` wraps each in a `ListItem`.

`useFilteredItems(items, criteria, accessors)` returns the filtered array. It delays only the filtering, by 200ms; the caller's input value stays immediate.

**A `Badge` used as a toggle is not a variant.** Selected and unselected are *states*, per Rule 2 — an unselected badge is `outline`, a selected one is filled with the primary color (§5.1). Selected must also be distinguishable without relying on color alone: the fill plus the weight change does this, and `aria-pressed` carries it for screen readers.

### 3.6 Post layouts are examples, not components

A post has a cover, title, date, tags and excerpt. That shape belongs to your site, not a UI kit — same reason §6 keeps the filtering generic.

So post layouts ship as **examples you copy and edit**. Two of them, one card-shaped and one row-shaped. Two is deliberate: it proves the pieces recombine.

**An example becomes a real component** when the same shape has held up across three separate uses without changing. Not before.

### 3.7 Not in v0

`InfiniteList`, `Banner`, `Sheet`, `TabMenu`, `Spinner`, `Checkbox`, `Reveal`, and the `useAsyncCallback` hook ([useAsyncCallback.ts:8](../bubble-kit/src/hooks/useAsyncCallback.ts:8)). That hook fits the kit and will likely come next.

**`InfiniteList` is deferred for the same reason it is worth building eventually.** It needs a scroll observer, a loading contract, an end-of-data signal and error handling — one of the most expensive pieces in the kit. And the first consumer is a personal portfolio, which will not have enough posts to paginate. Nothing in v0 uses it, and code with no user cannot be reviewed.

### 3.8 Which pieces run in the browser

Getting this wrong is silent — mark everything browser-only and it still works, just slower, with nothing to flag it.

**Browser only:** `ThemeProvider`, `usePalette`, `useMode`, `useFilteredItems`, `SearchField`, `FilterBar`.

**Server-renderable:** `Theme` (the nested wrapper), `Text` and its wrappers, `VStack`, `HStack`, `Surface`, `Card` and its parts, `CardLink`, `Page`, `List`, `ListItem`, `CardListItem`, `Skeleton`, `Separator`, `EmptyState`.

**`Button` and `Badge` are server-renderable as written.** They become browser-only when a caller attaches a click handler, which happens in the caller's file, not ours. Do not mark them browser-only pre-emptively.

The mechanism is a `'use client'` line at the top of the file, and it spreads through imports — a `FilterBar` that imports `Badge` makes that `Badge` run in the browser *in that part of the tree*. That is fine and expected; it is not a reason to mark `Badge` itself.

**`Skeleton` handles reduced motion with a CSS media query, not a JavaScript hook.** The old kit used a hook ([Skeleton.tsx:8](../bubble-kit/src/components/foundation/Skeleton.tsx:8)), which would force `Skeleton` into the browser and off this list.

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
:root:not([data-mode]) { color-scheme: light dark; }   /* no mode set = follow the reader's system */

[data-theme="forest"] {
  --page:  light-dark(#E7EDEA, #0C110F);
  --card:  light-dark(#FFFFFF, #1F2623);
  /* one line per role */
}
[data-theme="clash"] { /* same roles, other values */ }

[data-mode="light"] { color-scheme: light; }
[data-mode="dark"], .dark { color-scheme: dark; }
```

**That first line is not optional.** With no `color-scheme` set anywhere, the browser's default is `normal`, and `light-dark()` under `normal` picks the *light* value. So without it, any page or subtree with no mode attribute renders light no matter what the reader's system says — a consumer who installs the CSS but not the provider gets a permanently light site, and nothing anywhere reports a problem.

**Note the `:not([data-mode])`.** Written as a plain `:root`, that rule and the `[data-mode="light"]` rule below have identical specificity, so which one wins depends purely on the order they appear in the final stylesheet. Cascade layers, a bundler, or splitting the CSS across two files would silently flip it, and mode switching would stop working with no error. The `:not()` makes the rule mean what the sentence above says: apply only when no mode is set.

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

**Kit components never use `dark:`.** This is a rule, not a preference. A `dark:` utility matches by asking "is there a dark ancestor," which the cascade cannot un-ask. So inside a light island in a dark page, the token colors correctly flip to light while any `dark:` colors stay dark — you get a half-and-half island, silently. Rule 7 already makes `dark:` unnecessary: no component names a color, and every role token carries both modes through `light-dark()`.

**But the `dark:` variant must still be defined, for other people's code.** Components installed with `npx shadcn add` arrive with `dark:` utilities already in them. Tailwind's built-in `dark:` looks for a `.dark` class, and nothing in this setup ever writes one — `next-themes` writes `data-mode`. So without this line, every dropped-in component renders its light styling permanently, in every mode, silently:

```css
@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *, .dark, .dark *));
```

The kit still never writes `dark:` itself. The variant exists purely so third-party code works. (The alternative is telling `next-themes` to write both a class and the attribute; either is fine, but pick one and say which.)

Two more lines that are easy to miss:

- `@source "../src/components/**/*.{ts,tsx}"` — Tailwind must be told where to scan for class names when components live outside the app folder. **The path is relative to the stylesheet, not the project root**, so check it against wherever the CSS actually lives. A wrong path generates no utilities and reports nothing. Tailwind v4's automatic detection may already cover this; treat the directive as belt and braces.
- **Alias shadcn's variable names to ours.** Anyone running `npx shadcn add dialog` gets a component reading `--background`, `--foreground`, `--muted-foreground`, `--ring`, `--popover` and so on. Our roles have different names, so it would render unstyled. Inside `@theme inline` the names are prefixed, so the aliases look like this — write them in exactly this shape, because `--background: var(--page)` would generate no utility and report nothing:

  ```css
  @theme inline {
    --color-background: var(--page);
    --color-foreground: var(--text);
    --color-muted-foreground: var(--quiet);
    --color-ring: var(--focus-ring);
    /* ...and so on for card, popover, primary, secondary, accent, destructive, border, input */
  }
  ```

  **Two of shadcn's roles have nothing to point at.** It expects `secondary` and `destructive` (each with a `-foreground` partner); §5.1 has neither. Add a `danger` pair to §5.1 with its §4.6 rows and alias `destructive` to it — a UI kit with no error color will want one within a month anyway. Map `secondary` to the muted surface pair. `popover` maps to card, and `accent` to highlight.

**Verify in Step 2**, before any component exists:

1. Switch the mode and confirm a color actually changes.
2. Confirm `@source` is generating utilities for the component folder.
3. Confirm an opacity modifier works — `bg-primary/50` compiles to a color-mix around the variable, and mixing a `light-dark()` value is a newer combination than either feature alone. Cheap to check now, expensive to find later.
4. **Confirm a shadow changes with the mode.** The split shadow colours in §5.5 are the least-tested part of this setup. Tailwind's shadow utilities compose through internal properties rather than emitting the variable directly, so a custom shadow may work for `shadow-xs` and behave oddly the moment anyone writes `shadow-xs shadow-black/20`. Put the shadow tokens in `@theme inline` for the same reason as the colours — otherwise the value freezes at build time and the mode switch does nothing.
5. **Render the nesting case.** A dark page containing a light island containing a clash-palette island. This is the exact scenario §4.1 was rebuilt to support and nothing else in the plan renders it. Keep it as a permanent story, not a one-off check.

### 4.3 Three ways to override, smallest reach last

1. **A whole subtree** — `<Theme palette="clash">` or `<Theme mode="dark">`, or both, on any wrapper. Either can be set without the other, and whichever you leave out is inherited.
2. **One value** — set a single CSS variable inline on a wrapper.
3. **One part of one component** — `className` plus the `data-slot` markers from Rule 6.

None require the component to know anything.

Two details an agent will otherwise guess at:

- **`Theme` takes props named `palette` and `mode`, and renders `data-theme` and `data-mode`.** React will not turn a `theme` prop into a `data-theme` attribute on its own.
- **A light island inside a dark page must paint its own background.** Switching `color-scheme` changes what the tokens resolve to; it does not paint anything. `Theme` should set the page background and text color whenever it is given a mode, or the dark page shows through behind light-mode dark text. `Page` (§3.3) does the same job at the top level.

### 4.4 What React does — almost nothing

Colors never go into React state. A theme system built that way breaks nested overrides, breaks server rendering, and re-renders on every change. It would also force every component showing a color to run in the browser, which for a page that is mostly a list of posts is most of the performance.

**Use `next-themes` for the root provider.** It already does attribute writing, saving the choice, the before-paint script, and system-preference syncing — all fiddly, all easy to get subtly wrong. Point it at the `data-mode` attribute.

Hand-roll only the nested `Theme` wrapper, which `next-themes` does not do. Leave `next-themes`' `enableColorScheme` **on** for the root provider — it writes `color-scheme` directly onto `<html>`, which is what you want. (§4.4's note about turning it off applies only to a second provider for palettes, if you ever add one.)

**`next-themes` manages one attribute — the mode. Nothing manages the palette.** In v0 the palette is **fixed by the site at build time**; only nesting overrides it. The first consumer is a one-brand portfolio, so there is nothing to remember and nothing to flash.

If readers ever pick the palette themselves, do not hand-roll it: nest a second `next-themes` provider with `attribute="data-theme"`, its own storage key, `enableSystem` off and `enableColorScheme` off. That gets the before-paint script for free. Write this down when you do it, because it is not obvious.

**One trap to name explicitly.** The before-paint script changes attributes on `<html>` before React starts, so React reports a hydration mismatch. The fix is one prop: `<html suppressHydrationWarning>`. Say this in the code comment, because an agent that hits the warning will otherwise "fix" it by moving the theme into React state — destroying server rendering and nested overrides in the process.

### 4.5 Two palettes in v0

The default (§5.1), plus one built to clash.

The clashing palette is a test, not a product. Concretely:

- **A warm hue, around 30–40 degrees.** Any green left in a component will be obvious against it.
- **High colorfulness**, so a hardcoded muted grey stands out.
- **It inverts in both modes.** Light mode has a *dark* page (lightness around 30) with light text and a light primary around lightness 85. Dark mode has a *light* page (lightness around 92) with dark text and a dark primary around lightness 40.

Both halves are needed. Light mode inverted catches anything assuming "light mode means a pale background" and anything assuming the primary is the dark one. Dark mode inverted catches the mirror — anything assuming "dark mode means a dark background." And §7.2's four-up view shows both palettes across both modes, so leaving clash's dark mode undefined would leave one of the four cells to guesswork.

**It has to pass every §4.6 check like any other palette.** A test palette that cannot satisfy the contract is not testing the contract.

The inversion is the point, and it is why the earlier wording didn't work. The previous plan asked for a light-mode primary *lighter than the page* while also requiring the primary to reach 3:1 against the page. Against a pale page that is impossible — even pure white only reaches about 1.19. So the clash palette inverts the page instead: light mode with a dark background. That still catches every component assuming "the primary is the dark one" and additionally catches anything assuming "light mode means a pale background," which is a wider net.

A real second brand comes later.

### 4.6 The checks every palette must pass

One function, used by the test now and the color explorer later (§10), so the tool can never approve something the test would reject.

| Pair | Minimum | Why |
|---|---|---|
| Text on page, on card, on muted surface | 4.5 | body text |
| Quiet text on page, on card, on muted surface, on highlight | 4.5 | dates, captions |
| Text on a primary fill | 4.5 | button labels |
| Text on a highlight | 4.5 | hovered rows |
| Primary against page, against card | 3.0 | a selected filter tag carries state |
| Input border against page, against card | 3.0 | WCAG 1.4.11 |
| Focus ring against page, against card | 3.0 | see the note below |
| Border against page, against card | 1.4 | a hairline you can see |
| Border against muted surface | 1.25 | deliberately fainter; a separator inside a panel |
| Highlight against page, against card | 1.15 | hover has to be perceptible |
| Card against page | 1.15 | see the note below |
| Disabled text against disabled surface | 2.0 | the pair that actually occurs |
| Text on danger, against Danger | 4.5 | error buttons |
| Danger against page, against card | 3.0 | error states carry meaning |
| Primary against muted surface | 3.0 | a selected tag inside a panel |
| Focus ring against muted surface | 3.0 | a focused control inside a panel |

Rows name the roles from §5.1's table exactly. "Text on a highlight" means the **Text on highlight** role, not the plain **Text** role.

Every threshold is a number. "Visibly different" is not something a function can assert.

**The focus ring is checked against page and card, not against the primary fill.** That is because of how it is drawn: an outline sitting *outside* the control, on the surface behind it (§5.5). It never lands on the button's own fill, so contrast against the fill is not the question. If you ever switch to an inset ring, this row has to change.

**Card against page is checked, after r5 wrongly dropped it.** The reasoning for dropping it was that a card is separated by its shadow and its edge anyway. Both halves fail. The shadow colour is keyed to the *mode*, not to how light the page is — and the clashing palette's light mode has a dark page, where black at 6% is invisible. And `Surface`'s default variant is `plain`, which has neither border nor shadow. So in clash light mode a plain card on the page would have nothing separating it at all, which is exactly the bug the clashing palette exists to find.

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
| Border | `#B8C0BD` | `#474F4C` |
| Input border | `#4F5854` | `#6D7773` |
| Focus ring | `#007C60` | `#C2E8D9` |
| Disabled surface | `#D2D9D6` | `#353D39` |
| Disabled text | `#7F8985` | `#6D7773` |
| Danger | `#AC1A1C` | `#F47C70` |
| Text on danger | `#FFFFFF` | `#00160F` |

**Every check in §4.6 passes in both modes.** Measured by the script, not transcribed by hand — regenerate the table from the script rather than editing it by hand, or the two drift.

Some roles deliberately share a value: in light mode the input border and quiet text are both `#4F5854`, and the disabled surface and muted surface are both `#D2D9D6`. That is an outcome, not an oversight — but it means changing one role by hand can move two things.

**The dark border was `#424A47` in r5 and failed.** Against the dark muted surface it measured 1.226, under a 1.25 floor — and r5 claimed every check passed. `#474F4C` clears it at 1.33 and still passes against page (2.26) and card (1.83). Do not fix a failure like this by lowering the threshold; the point of §4.6 is that thresholds are set before the colors are.

**Danger is a new role in r6**, added because shadcn components expect one and because a kit with no error colour will want one within a month. Light is a deep red with white text (7.18); dark is a soft coral with dark ink (7.08). Both clear 3.0 against page and card.

**The dark focus ring is a pale mint, not the primary colour.** In r4 they were the same hex, which made a focused primary button's ring invisible if the ring were ever drawn inside the control. The outline technique in §5.5 makes that moot, but two roles sharing a hex when one exists to contrast with the other is asking for trouble later.

**Known open item:** the light-mode input border (`#4F5854`) measures about 6.2 against the page where 3.0 is required. It is safe but visually heavy — a noticeably dark outline on every text field. Worth softening once you can see it on a real page. Anything above 3.0 is fine.

**A selected filter tag is filled with the primary color, not the highlight.** No pale tint can reach 3:1 against the page — the highlight tops out near 1.2 before it stops looking like a tint. Since a selected tag communicates the state of a control, it needs 3:1. A primary fill measures about 6.3 in light and 8.1 in dark. The highlight stays what it is good for: hover and gentle emphasis.

**An unselected tag is outlined** — border and text, no fill. So selected and unselected differ by fill, by text color and by weight, not by hue alone, which is what someone who cannot distinguish the colors needs.

**How the palette was built.** The starting point was a generated ramp at brand hue 170, with these lightness steps: 98, 95, 90, 82, 72, 62, 52, 44, 36, 27, 18, 13. Colorfulness rises to about 0.105 in the middle and falls at both ends, and anything outside what a screen can show is pulled back until it fits. The greys use the same hue at colorfulness 0.003 to 0.013 — barely there, enough to relate. Danger uses hue 27 on the same idea.

**Several roles were then hand-tuned off that ramp** to pass §4.6 — the page, the muted surface, the highlight, the border and several dark-mode roles all sit between steps.

**So the hex values in the table above are the source of truth.** They live in the palette TypeScript file, hand-fixed. `scripts/build-palette.ts` does not generate them; it *measures* them, printing every §4.6 pair with its number. Regenerating colours from the ramp would produce different values than the table. Regenerating the contrast numbers from the script is not only fine but required, since r5 claimed numbers it had not measured and one of them was wrong.

### 5.2 OKLCH to write, OKLab to blend

Same color space, two ways of writing it. OKLCH gives lightness, colorfulness and hue — numbers you can reason about, which is what building a ramp needs. OKLab is the form for blending and gradients, because colors mixed that way do not drift through muddy hues.

**Write `oklch()`. Blend `in oklab`.**

### 5.3 Spacing

**Use Tailwind's spacing scale, and only that.** Do not export `x1` / `x1_5` / `x2` tokens — that would be a second spacing system, and an agent would not know whether to write `gap-2` or `gap-x1`.

The old kit's names are useful only as a translation note when reading it: its `x1` (8px) is Tailwind's `2`, its `x1_5` (12px) is `3`, its `x2` (16px) is `4`. The 8px rhythm survives as a habit — prefer even Tailwind steps — not as an API.

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

**Shadows** need different values per mode — but `light-dark()` only accepts colors, so a whole shadow value cannot go inside it. Split the color out and keep the geometry fixed:

```css
--shadow-color-xs: light-dark(rgb(0 0 0 / 0.06), rgb(0 0 0 / 0.4));
--shadow-color-sm: light-dark(rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.5));
--shadow-color-md: light-dark(rgb(0 0 0 / 0.10), rgb(0 0 0 / 0.6));

--shadow-xs: 0 1px 2px var(--shadow-color-xs);
--shadow-sm: 0 2px 6px var(--shadow-color-sm);
--shadow-md: 0 6px 16px var(--shadow-color-md);
```

Three color tokens rather than one, because the transparency differs by size as well as by mode. Without this an agent reaches for a `dark:` utility, which §4.2 forbids for good reason.

The raised `Surface` uses `shadow-xs`. Because the page is tinted and cards are white, the shadow is a second signal, not the only one.

**Motion:** fast 120ms, normal 200ms, easing `cubic-bezier(0.2, 0, 0, 1)`. Everything that moves is wrapped so it holds still for readers who asked for reduced motion.

**Target size:** 24px minimum for anything clickable, per WCAG 2.5.8. 44px for primary touch targets. This matters most for `Badge` used as a toggle, which is otherwise the smallest clickable thing in the kit.

**Focus outlines: one technique, described exactly.**

```css
outline: 2px solid var(--focus-ring);
outline-offset: 2px;
```

That is it. No offset ring, no filled gap. Two reasons this is the right one:

- `outline-offset` leaves a gap showing **whatever is actually behind the control**. A filled gap would paint the page color, so a button inside a white card would get a grey halo drawn on the card.
- Because the outline sits outside the control, it never lands on the button's own fill. So the ring only needs to contrast with the page and the card, which is exactly what §4.6 checks — and why a dark-mode ring close to the primary color would still be fine.

The ring has its own color (§5.1) rather than reusing the primary, so a focused primary button never gets an outline the same color as itself.

**Style `:focus-visible`, never `:focus`.** `:focus` puts a ring on every mouse click. This also matters for reviewing — see §7.2.

---

## 6. Filtering

The one piece of real logic. Ships on its own — no React, no dependencies — so anything can use it.

It knows nothing about posts. You tell it how to read tags and text from your own objects.

One discipline throughout: inputs are `readonly`, returns are plain arrays.

```ts
type Criteria = {
  text?: string
  tags?: readonly string[]
  match?: 'all' | 'any'        // default 'all'
}

type Accessors<T> = {
  getTags?: (item: T) => readonly string[] | undefined
  getText?: (item: T) => string
}

filterItems<T>(items, criteria, accessors): readonly T[]
collectTags<T>(items, accessors): { tag: string; count: number }[]
collectTagsWithSelection<T>(items, criteria, accessors): { tag: string; count: number; selected: boolean; disabled: boolean }[]
toggleTag(selected: readonly string[], tag: string): string[]   // returns a new array
```

Both `collectTags` functions take the same `accessors` object, so the two do not have different shapes for the same idea.

**Picking several tags narrows the results** — an item must have all of them. `match: 'all' | 'any'` is a field on `criteria`, defaulting to `'all'`, so a different site can flip it to widening.

Because narrowing is the default, `collectTagsWithSelection` can mark a tag that would leave you with nothing, and `FilterBar` greys it out before you click. Under widening this does almost nothing, which is worth knowing but not worth removing the function over.

Details to pin down:

- **Text search ignores case and accents, in three steps:** decompose the text, remove Latin combining marks (the `\u0300`–`\u036F` range), **then recompose**. That last step is not optional — decomposing splits Korean syllables into parts, and without recomposing you would compare split text against unsplit text and match nothing. Skipping it breaks the exact languages the accent-stripping was meant not to break.
- Search matches anywhere in the text, not just at word starts.
- Search and tag filtering combine with "and".
- Output preserves input order.
- **`collectTags` counts every item, ignoring the current selection.** `collectTagsWithSelection` recounts against the current criteria, marks a tag `selected` when it is currently on, and `disabled` when *adding* it would leave nothing. So the plain version is for a static tag cloud, and the selection-aware one is for a live filter bar.
- **A currently-selected tag is never disabled.** The question is "would adding this leave nothing," not "would toggling this" — otherwise tags you already have on get greyed out, which looks like a bug.
- **Both `collectTags` functions return tags ordered by count, highest first, then alphabetically when counts tie.** That order is visible on screen as the order of the filter row, and "wrong" is not something you can spot by eye, so it has to be specified.
- **Tag matching is exact and case-sensitive.** `"React"` and `"react"` are different tags. Duplicate tags on one item are counted once. If a consumer wants case-insensitive tags, they normalise in `getTags`.
- With nothing selected, the same array comes back. That does not make React skip work by itself — it lets `useMemo` and `React.memo` skip, if the caller uses them.
- Empty text, whitespace-only text and an empty tag list all count as nothing selected.

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

One more point in Storybook's favor, which only became true with §4's rebuilt theming: Storybook renders stories into a `<div>`, never into `<html>`. The old two-attribute design needed both attributes on the same element, which is awkward from a wrapper. The current design works from any wrapper, because `color-scheme` inherits. So the theme rebuild made Storybook the easier option, not just the cheaper one.

### 7.2 What to set up

**Storybook**, with the Next.js framework, plus:

- A toolbar control for palette and mode — two dropdowns, about twenty lines, wrapping each story in the right attributes.
- **The pseudo-states addon.** This is the important one. Only one element on a page can hold keyboard focus, so a grid of buttons shows twenty resting states and no focus ring. The addon forces the states so you can see them side by side. Without it an agent can ship a component with no focus style and nothing will reveal it.

  **Stories must force `focus-visible`, not `focus`.** The addon treats them as different states, and §5.5 requires components to style `focus-visible`. Ask for `focus` and *nothing appears* — the natural conclusion being "this component has no focus ring," and the natural agent fix being to restyle it to `:focus`, which then shows a ring on every mouse click. Two words in the story, and it protects the single most important thing this addon exists to catch.

- The accessibility addon, for labels, roles and structure. It runs in a real browser, so unlike the test-runner checker it *can* see contrast — but only for the one palette and mode the toolbar happens to be on, and it reports "cannot tell" for text over images, which is exactly the card cover case. It complements the numeric checks in §4.6; it does not replace them.
- Viewports at 375, 768 and 1440. The first consumer is a portfolio read on phones; nothing else in the plan would surface a card that breaks at 375.
- **A four-up decorator**, available from the toolbar: renders the story four times in a grid — both palettes across both modes. The whole point of a clashing palette (§4.5) is catching a component that assumes the primary is dark, and you catch that by seeing both at once rather than by toggling and remembering. About twenty lines, and it recovers the one thing the custom app would have done better.

**Check the addon package names and versions at setup time and record what you installed.** These move between Storybook releases — some are maintained by the community, others get folded into core and are configured through parameters rather than installed. Same instruction as the registry template in Step 0. If the pseudo-states addon turns out to be unavailable, fall back to stories that apply the state classes directly, and **say so in the pull request** — losing it silently means losing the focus-ring check.

**Every interactive component gets a story showing all its states**, forced: normal, hover, focus-visible, pressed, disabled.

**The theme decorator must paint a background.** Storybook renders into its own canvas, which is white. A wrapper that only sets `data-theme` and `data-mode` gives you dark-mode text on a white canvas — near-white on white — and every story looks broken in dark mode. The decorator sets the page background, the text color and a minimum height. Four lines, and without them your only review surface is unusable half the time.

**Shared awkward content** in one file, used by every story that shows text or lists: empty string, one character, a 200-character title, a 60-character word with no spaces, 0 / 1 / 3 / 24 tags, a missing image, a missing date. These catch overflow and clipping that tidy sample content never will.

### 7.3 Two hand-written pages in the Next app

Storybook is bad at both of these, and they are the pages you will look at most.

- **`/tokens`** — every color pair, both modes, both palettes, with its measured contrast number and a pass or fail mark. It uses the same check function as the test (§4.6), so the page can never show a pass the test would fail. This is what you check in Step 2, before any component exists, and showing four combinations at once is why `Theme` has to take a mode (§4.3).
- **`/kitchen-sink`** — a realistic composed page: filter bar, a list of post cards, an empty state. Built from the kit, at real page width. This is the "first real user" check, as one file rather than an application.

### 7.4 Screenshots come later

Look in the browser first. Once a component settles, save reference pictures with Playwright so later changes show only what changed. Reference images of something still moving are just noise.

---

## 8. Bugs in the old kit — do not copy these

The old palette is not carried over. This is why.

1. **The grey ramp is out of order.** The file says higher numbers are darker ([colors.ts:21](../bubble-kit/src/styles/colors.ts:21)). They are not: `gray_200` is lighter than `gray_50`, and `gray_300` is lighter than both `gray_250` and `gray_100`.
2. **A color named teal is purple.** `teal_transl_100` ([colors.ts:47](../bubble-kit/src/styles/colors.ts:47)) is the primary purple at 36% transparency.
3. **Two unrelated colors differ by one underscore.** `pink500` is a real pink; `pink_500` is the purple primary ([colors.ts:64](../bubble-kit/src/styles/colors.ts:64), [colors.ts:72](../bubble-kit/src/styles/colors.ts:72)).
4. **`muted` means two different colors depending on where you look.** `#C4C4C6` at the top level, `#AEB0C4` under `text` ([colors.ts:99](../bubble-kit/src/styles/colors.ts:99), [colors.ts:156](../bubble-kit/src/styles/colors.ts:156)).
5. **Quiet text fails contrast.** `Placeholder` ([Text.tsx:55](../bubble-kit/src/components/foundation/Text.tsx:55)) uses the muted text color, which resolves through `Colored` ([foundation.ts:610](../bubble-kit/src/styles/foundation.ts:610)) to `#AEB0C4` — **2.14 against white**, where 4.5 is the minimum. No grey in that ramp passes until `gray_700`.
6. **Everything leaks into the semantic layer.** `Color` spreads the whole raw palette into itself ([colors.ts:88](../bubble-kit/src/styles/colors.ts:88)), so every raw color is also a semantic name. That is the mechanism behind the sprawl, and why raw colors stay private here (Rule 7).

**A pattern to avoid across the whole kit, not one file.** Several components take boolean style props typed as a record of every style name, then spread all remaining props onto the element. On the web that leaks invalid attributes into the DOM — things like `gray_400="true"`. It appears in `Text` ([Text.tsx:76](../bubble-kit/src/components/foundation/Text.tsx:76)), `Skeleton` ([Skeleton.tsx:8](../bubble-kit/src/components/foundation/Skeleton.tsx:8)), `Card` ([Card.tsx:19](../bubble-kit/src/components/foundation/Card/Card.tsx:19)) and `Layout` ([Layout.tsx:25](../bubble-kit/src/components/foundation/Layout.tsx:25)). Rule 4 removes most of it by turning these into named components. Where a prop remains, list the style props explicitly and destructure them.

**And the old kit's default text colour is the brand purple**, not a neutral — `Text` falls back to `Color.text.dark`, which resolves to `purple_900`. That is §8 item 6 doing damage at the worst possible place: the default. It argues for Rule 7 from the other side — not only "never name a colour" but "the default text role must be a text role, not a brand role."

**And the prop-lookup pattern already fails silently in the old kit.** `Text` looks each prop up in three tables in turn ([Text.tsx:76](../bubble-kit/src/components/foundation/Text.tsx:76)), with a comment at line 78 warning that no name may appear in two of them. That warning is already violated: `light` is a font weight *and* a text color. So `<Text light>` sets a light weight and white text — white on white. This is the clearest possible argument for Rule 4, and it is why the new kit uses named components and explicit prop lists rather than name lookup.

**Never read the screen size, at load or during render.** The old `Card` reads it when the file loads ([Card.tsx:40](../bubble-kit/src/components/foundation/Card/Card.tsx:40)), which on the web crashes during server rendering. `List` reads it *inside* the render ([List.tsx:159](../bubble-kit/src/components/foundation/List.tsx:159)), which does not crash but never updates on resize and disagrees between server and browser. An agent that hits the crash may "fix" it by marking `Card` browser-only, quietly losing the server rendering §4.4 depends on. Use CSS and container queries.

**The old skeleton animation never stops and ignores reduced motion.** `useBreathingOpacity` loops forever with no reduced-motion path. §3.8 requires the new one to use a CSS media query instead, so `Skeleton` stays server-renderable.

Also: the old `Card` is always pressable. The new one is a plain box unless `CardLink` makes it clickable (§3.3).

---

## 9. Order of work

**Roughly 13–15 days**, including time to review and revise. Storybook rather than a custom app is what keeps it from being considerably more. Treat these as rough — the order matters more than the totals.

### Step 0 — set up (half a day)

Start from shadcn's registry template if it still does what we expect — registry files, build, and hosting in one piece. **Check first and say in the pull request which way you went.** If it has changed, set up a plain Next.js app.

**Create the registry files in this step**, not later: `components.json` and `registry.json`, plus whatever build command turns items into published JSON. Step 4 says each component ships "a registry entry" and nothing else sets up the thing entries go into.

**Confirm the registry item format against the current shadcn docs rather than assuming it.** Each item has a plain `name` — `card`, `button` — and consumers reach it either by URL or through a namespace such as `@bb-kit` that they configure on their side. Item names are public API and expensive to change, so verify and record what you found.

Install: Tailwind v4, shadcn's setup, `cva`, `clsx`, `tailwind-merge`, Base UI, `next-themes`, Vitest with Testing Library and an accessibility checker, Playwright, Storybook with the Next framework plus the pseudo-states, accessibility and viewport support. **Check the addon package names and versions as you go** — see §7.2. Add a license.

**Not** `isolatedDeclarations` — it speeds up producing type files for a published package, and this kit publishes none.

**Not** Style Dictionary. It converts one token source into many platforms, which is worth it once SwiftUI is real. Today it would convert colors into CSS and nothing else, and it has no built-in Tailwind v4 output, so someone would have to write a custom formatter that emits `@theme inline` correctly. Instead: **both palettes live in one TypeScript file.** The check function imports it, the test imports it, and `scripts/build-tokens.ts` imports it and writes the CSS. That gives §4.6's single-implementation guarantee more directly than routing through JSON.

**Not** changesets — it versions npm packages, and this ships through a registry.

**Not** Base UI. r5 installed it and never used it. It was there for `asChild`, which `CardLink` replaced (§3.3), and nothing in v0 needs a headless UI library — there is no dialog, select, popover or menu. Where `asChild` is still wanted, use Radix's `Slot` (`@radix-ui/react-slot`, about forty lines, and what shadcn itself uses) and say so.

**Write two enforcement tests in this step, before any component exists.** Two of §2's rules carry the whole design and are otherwise honour-system, in a kit whose owner will never read the source:

1. **No colours in component source.** Scan `src/components` for hex literals, `rgb(`, `oklch(`, `dark:`, and Tailwind's built-in colour classes (`text-white`, `bg-black`, `bg-gray-*`, `text-slate-*` and friends). Fail on any hit. Fifteen lines, and it turns Rule 7 and the `dark:` ban from things an agent must remember into things the build refuses.

   The violation this catches is specific and likely: `text-white` on a primary button. In the default palette's light mode, "text on primary" *is* white — so it looks perfect in three of the four palette-and-mode combinations and is white-on-mint in the fourth.

2. **The token CSS is up to date.** Regenerate it and fail if the result differs from what is committed. Otherwise someone edits the palette file, forgets to run the build, and everything still compiles with stale colours.

**Say when the token build runs:** in `predev` and `prebuild`, with CI running the check above.

**Name the packages you install rather than describing them** — `class-variance-authority` (not the newer `cva` package, which has a different API), and whichever accessibility checker for Vitest you settle on. License: MIT.

### Step 1 — decide and record (half a day, no code)

Write §2, §4 and §5 down as the settled contract. Look at the colors on a screen and fix anything wrong in practice. If they hold up, this is twenty minutes — which is the idea.

### Step 2 — theming and colors (1.5 days)

**Theming first, before any component.** Build the palette file, the CSS from §4.1, and the `next-themes` root provider plus the nested wrapper. Then work through §4.2's five verification steps in order. If any fails, everything built afterwards is wrong and silent.

Then both palettes, the check function from §4.6, a test running it over every palette and mode, and the `/tokens` page.

### Step 3 — logic (half a day)

The filtering functions and the hook. No UI needed, so it can happen while the rest settles. Test this hardest — it is the only part with real logic, and it is plain functions, so testing is cheap.

### Step 4 — components (5–6 days)

Order, with the small shared pieces early because everything else leans on them:

`Text` and its wrappers → `VStack` and `HStack` → `Page` → `Theme` → `Surface` → **`Skeleton`, `Separator`, `EmptyState`** → `Button` → `Card` and parts → `CardLink` → **`ListItem` → `List`** → `Badge` → `SearchField` → `FilterBar`. Post examples last.

Two ordering rules, both learned the hard way: `Skeleton` and `EmptyState` come before `List`, because `List` owns the loading and empty states. And `ListItem` comes before `List`, because a list with no row to put in it has nothing to show in a story — and nothing is done until it can be looked at.

Each component ships with: the source, a registry entry with a real description, a story showing every form, a states story for anything interactive, and tests.

**A component is not done until it is in Storybook with its states visible.**

Build `/kitchen-sink` once `List`, `CardListItem` and `FilterBar` exist. That is where the pieces get tested against each other rather than in isolation.

### Step 4.5 — look and fix (2–3 days)

Budget actual time for you looking at things and asking for changes. Every earlier version of this plan implicitly assumed one pass and no revisions, which has never been true of anything.

### Step 5 — the agent layer (1 day)

A skill file explaining the kit, and an always-on file carrying §2's rules. Registry entries with real descriptions, since that is what an agent searching a registry reads.

Two checks, and they test different things:

- **Selection.** Ask an agent to build a filtered post list and see whether it picks the right pieces.
- **Installation.** Create a scratch Next app, install every registry item into it, and confirm it builds and renders. The registry is the only way this kit reaches anything, and nothing before this step exercises it. Storybook can look perfect while the kit is undeliverable.

---

## 10. Later

- **A color explorer**, like coolors.co: pick a hue, sweep a ramp, watch every check pass or fail live, save it as a palette. Icing, after v0.

  Build from existing libraries, not hand-rolled color maths: `culori` for conversion and gamut handling, `apcach` if contrast-targeted generation helps, `react-colorful` for the picker. It must use the same check function from §4.6, and write palette files rather than CSS. Whatever writes files must be development-only — it is file access behind a web request.

- A real second brand palette.
- The remaining components from §3.6.
- A SwiftUI version. Only token names travel, not components. Style Dictionary earns its place at that point.

---

## 11. Things worth a second opinion

1. **The theme system (§4).** Two reviews in, the core design — one palette attribute plus an inherited `color-scheme`, read by `light-dark()` — has been checked and holds. What is newer and less checked: the default `color-scheme: light dark`, the ban on `dark:` inside the kit, the shadcn variable aliases, and the split shadow colors in §5.5. Those are the parts most likely to be wrong now.
2. **The clashing palette (§4.5).** Respecified after the previous version turned out to be impossible. A dark page in light mode is unusual enough to be worth a second opinion on whether it tests the right things.
3. **The named-component pattern (Rule 4) and the variant table (§3.5).** Whether the values and defaults are the ones an agent would guess, and whether `PrimaryButton` versus `variant="primary"` is a distinction that helps or just doubles the API.
4. **About 35 exports** (§3). A previous review argued for cutting toward eighteen; r6 trimmed four by making `CardListItem` and `PlainSurface` named wrappers rather than components, and by dropping `Badge`'s unused `plain` variant. Whether the rest earn their place is still worth challenging.
5. **The default palette (§5.1).** Every check passes, but passing is not the same as looking good.
