import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { PaletteName } from "./palette"

/**
 * §4.2's fourth verification, kept as a story rather than a one-off check: the
 * same `shadow-*` utility has to darken when the mode flips, because the colour
 * comes through a `light-dark()` variable the geometry references. If the two
 * columns below look alike, the shadow colour froze at build time.
 *
 * The utilities are used deliberately in preference to `boxShadow: var(...)` —
 * Tailwind composes shadows through its own internal properties, so the
 * variable resolving correctly is not the same as the utility working.
 *
 * That reading applies to Forest. Clash light is flat by design — bbk-780.
 */
const meta: Meta<typeof Shadows> = {
  title: "Tokens/Shadows",
  component: Shadows,
}

export default meta

export const Forest: StoryObj<typeof Shadows> = { args: { palette: "forest" } }

/**
 * The note renders rather than sitting in a comment, because the person judging
 * this story never reads the source — and without it clash light looks broken.
 */
export const Clash: StoryObj<typeof Shadows> = {
  args: { palette: "clash" },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <p className="max-w-prose text-sm text-quiet">
        Clash light is meant to look flat. Its page is dark, so black at 6–10% barely moves it and
        all three sizes land within a few units of each other. The shadow colour keys to the mode,
        not to how light the page is.
      </p>
      <Shadows {...args} />
    </div>
  ),
}

function Shadows({ palette }: { palette: PaletteName }) {
  return (
    <div className="flex gap-6">
      {MODES.map((mode) => (
        <div key={mode} data-theme={palette} data-mode={mode} className="flex-1 bg-page p-6 text-text">
          <p className="mb-4">{mode}</p>
          <div className="flex flex-col gap-6">
            {SIZES.map((size) => (
              <div key={size} className={`rounded-lg bg-card p-4 ${size}`}>
                <code>{size}</code>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const MODES = ["light", "dark"] as const

// Written out rather than interpolated: Tailwind scans source text, so a class
// name built from a variable is never generated.
const SIZES = ["shadow-xs", "shadow-sm", "shadow-md"]
