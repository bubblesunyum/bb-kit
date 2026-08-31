@AGENTS.md

# bb-kit

A web UI kit. Small, well-made React components that an agent installs and
composes, and that a person checks by looking at them in a browser.

It ships three things: design tokens (plain data), components (React), and
logic (hooks and plain functions). It contains no actual site — no portfolio,
no `Post` type.

**The plan is [.opencode/plans/bb-kit-foundation-r7.md](.opencode/plans/bb-kit-foundation-r7.md).**
It is the spec. r7 replaces r6 and everything before it; ignore the older
files in that folder. Where this file and the plan disagree, the plan wins.

**The old kit is `../bubble-kit`** (React Native). Read it for reference only.
Its bugs are catalogued in plan §8 — do not copy them.

## The seven rules

These decide most judgement calls. Plan §2 has the full text; this is the short
form.

1. **Simple but smart.** A component does the obvious thing well with no
   configuration. `<VStack>` gives a sensible gap without being asked.
2. **Build big things from small exported pieces.** Want a version without one
   part? Build it from the same pieces. **Never add a way to switch a part
   off.** State props (loading, selected, disabled) are fine. Structural
   on/off props are not.
3. **Be careful about adding props.** If the prop did not exist, would normal
   use be wrong? If no, skip it. No negative props (`noScroll`, `noHeader`).
   If a default needs a switch to turn it off, the default was wrong.
4. **Named components over a form-selecting prop.** `PrimaryButton`, not
   `<Button variant="primary">` at the call site — though `variant` still
   exists underneath, and is spelled `variant` because that is what an agent
   types from habit. Size stays an ordinary prop.
5. **New component when the shape changes, a variant when only the paint
   changes.**
6. **Everything is overridable from outside.** Every component takes
   `className` and passes it through. Every internal part carries `data-slot`.
   Combine classes with `cn()` (clsx + tailwind-merge), caller's last —
   concatenating lets specificity decide the winner instead of order.
7. **No component ever names a color.** Roles only: page, card, text, quiet,
   primary. Never a hex, never a raw palette name, never a Tailwind built-in
   color class. A test enforces this.

## Architecture

**Compose.** Reach for a HOC, render prop, or config-driven engine only when
composition is overwhelmingly more awkward, which is rare. Try a hook first.

**Build up in layers**, each composing the one below rather than reaching past
it: `VStack`/`HStack` → `ListItem`, `List` → `FilterBar` → a page. A primitive
never knows about a domain. A page never reimplements layout a primitive
already solved.

**Build capabilities, not features.** Asked for infinite scroll on one list,
build the reusable primitive and use it there.

**JSX is configuration.** Express structure directly in JSX rather than
building a config object that JSX inflates. Config objects earn their place
when the content is genuinely data-shaped.

**Component shape.** Roughly one responsibility each. Extract before nesting
more than a few levels — usually as a private subcomponent in the same file,
not automatically a new file. Promote to its own file once something else
imports it. Extend the element's native props (`ComponentProps<'button'>`)
and spread the rest through rather than redeclaring what the platform gives
you.

**Hooks organize, not just reuse.** Group related state and logic into a hook
even when used once — the same instinct as splitting a long function. A
component body should read as a short list of what it needs.

**File layout for a file of any size:** public API first, private helpers and
subcomponents next, static types and constants at the bottom.

## What the old kit did that we do not

The old CLAUDE.md is good on composition and hooks. Four of its habits are
explicitly reversed here, and an agent that has read it will reach for them:

- **No boolean shorthand style props.** `<Text sm accent bold>` is out. Those
  spread unknown props onto the DOM (`gray_400="true"`), and the old `Text`
  already shipped a real bug from it — `light` was both a weight and a color,
  so `<Text light>` rendered white on white. List props explicitly and
  destructure them. Rule 4 covers most of the need.
- **No `loading` prop on `Text` or the stacks.** Both were broken in the old
  kit — wrong skeleton height, and children swapped for one thin bar. Callers
  place `Skeleton` themselves. `List` still owns its loading state, because it
  takes data and can tell empty from empty.
- **No spacing atoms.** No `x1` / `x2` tokens. Use Tailwind's scale and only
  that; a second spacing system means an agent cannot tell whether to write
  `gap-2` or `gap-x1`. The 8px rhythm survives as a habit — prefer even steps.
- **Raw colors stay private.** The old kit spread the whole raw palette into
  the semantic layer, so every raw color was also a semantic name. That is the
  sprawl Rule 7 exists to prevent.

**Never read the screen size**, at load or during render. The old `Card` read
it at module load, which crashes during server rendering; `List` read it inside
render, which never updates on resize. Use CSS and container queries.

## Naming

Fewest words that fully and unambiguously describe the thing. `InfiniteList`,
not `List2` or `ScrollableInfiniteList`. Booleans read as booleans (`isVisible`,
`selected`), never `flag`- or `data`-shaped. The color prop is `tone`, not
`color`, because `color` is a real HTML attribute and would collide.

## Comments

Rare. A comment earns its place by explaining a *why* — a workaround, a
constraint, a platform gotcha. Never restate the code.

## Types

Derive from the source of truth rather than duplicating:
`type FooProps = Parameters<typeof Foo>[0]`. Use `import type` for type-only
imports. Filter inputs are `readonly`; returns are plain arrays.

## Theming

Two settings that move independently: **palette** and **mode**.

One attribute for the palette (`data-theme`), and the browser's own
`color-scheme` for the mode, read by `light-dark()`. Matching both attributes
in a selector does not work — CSS attribute selectors do not inherit, so a
nested palette override with no mode set matches nothing and silently does
nothing. `color-scheme` does inherit, which is the whole reason for this shape.

Three things that break silently if missed:

- `:root:not([data-mode])` must set `color-scheme: light dark`. Without it the
  default is `normal` and `light-dark()` picks light everywhere.
- Tailwind needs `@theme inline`, or it resolves tokens at build time and
  theme switching does nothing.
- **Kit components never write `dark:`.** A `dark:` utility asks "is there a
  dark ancestor," which the cascade cannot un-ask, so a light island inside a
  dark page comes out half-and-half. The `dark:` variant is still *defined*,
  for dropped-in shadcn components — the kit just never uses it. A test
  enforces this.

Colors never go into React state.

## Testing

Mock at the boundary, not internals. Query by role and text the way a user
would. Build fixture factories rather than inlining ad-hoc objects. Test the
filtering logic hardest — it is the only part with real logic and it is plain
functions, so testing is cheap.

Two enforcement tests exist because two rules carry the whole design and are
otherwise honour-system: no colors in component source, and the token CSS is
regenerated and matches what is committed.

## Looking at it is the acceptance step

The owner of this kit will never read the source. Their only way to judge the
work is Storybook. **A thing that is not visible there is a thing that does not
exist.** A component is not done until it is in Storybook with its states
visible.

Stories force `focus-visible`, never `focus`. Asking for `focus` shows nothing,
and the natural wrong fix is to restyle the component to `:focus`, which puts a
ring on every mouse click.

## Animation

Prefer animated over jumping between states. The point is showing where
something came from and where it goes back to — give the eye something to
follow. Do not animate everything. Animate a few things purely for delight,
and make those worth it: fluid, springy, smooth. Turn animations into
capabilities — hooks and wrapping components with good defaults and terse
call sites. Everything that moves holds still for readers who asked for
reduced motion, via a CSS media query rather than a JS hook.

## Commits

Lowercase, terse, plain English. No conventional-commit prefixes. Commit after
a complete capability, once the thing builds and runs. Infrastructure with
nothing user-facing is still worth committing. Every commit names its bead.
