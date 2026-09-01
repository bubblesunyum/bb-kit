import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { cn } from "@/lib/utils"

/**
 * §4.2's fourth verification: the same `shadow-*` utility has to darken when the
 * mode flips, because the colour comes through a `light-dark()` variable that
 * the geometry references. If the four-up cells look alike, the shadow colour
 * froze at build time.
 *
 * The utilities are used deliberately in preference to `boxShadow: var(...)` —
 * Tailwind composes shadows through its own internal properties, so the
 * variable resolving correctly is not the same as the utility working.
 *
 * Palette and mode come from the toolbar; the story pins neither.
 */
const meta: Meta<typeof Shadows> = {
  title: "Tokens/Shadows",
  component: Shadows,
}

export default meta

export const Sizes: StoryObj<typeof Shadows> = {}

function Shadows() {
  return (
    <div className="flex flex-col gap-4">
      {/* This renders rather than sitting in a comment, because the person
          judging the story never reads the source — and without it clash light
          looks broken. */}
      <p className="text-quiet max-w-prose text-sm">
        Clash light is meant to look flat. Its page is dark, so black at 6–10% barely moves it and
        all three sizes land within a few units of each other. The shadow colour keys to the mode,
        not to how light the page is — bbk-780.
      </p>
      <div className="flex gap-6">
        {SIZES.map((size) => (
          <div key={size} className={cn("bg-card rounded-lg p-4", size)}>
            <code>{size}</code>
          </div>
        ))}
      </div>
    </div>
  )
}

// Written out rather than interpolated: Tailwind scans source text, so a class
// name built from a variable is never generated.
const SIZES = ["shadow-xs", "shadow-sm", "shadow-md"]
