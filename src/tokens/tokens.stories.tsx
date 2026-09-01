import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { cn } from "@/lib/utils"
import { ROLES } from "./palette"

/**
 * Every role, as a swatch. Palette and mode come from the toolbar, and the
 * four-up layout shows all four combinations at once — this story sets neither,
 * which is what lets it.
 *
 * The measured contrast numbers live on /tokens (§7.3) rather than here.
 * Storybook is where you check that a role *looks* right; the page is where you
 * check that it clears its threshold.
 */
const meta: Meta<typeof Swatches> = {
  title: "Tokens/Roles",
  component: Swatches,
}

export default meta

export const All: StoryObj<typeof Swatches> = {}

/** Forced, because only one element on a page can hold focus at a time. */
export const FocusedAndHovered: StoryObj<typeof Swatches> = {
  parameters: { pseudo: { hover: "#hover-me", focusVisible: "#focus-me" } },
}

function Swatches() {
  return (
    <div className="flex flex-col gap-2">
      {ROLES.map((role) => (
        <div key={role} className="flex items-center gap-2">
          <span
            className="border-border size-8 border"
            // The one place a raw variable belongs: the subject of the story is
            // the role itself, so it has to be addressed by name.
            style={{ background: `var(--${role})` }}
          />
          <code>{role}</code>
        </div>
      ))}
      <div className="mt-4 flex gap-2">
        <button id="hover-me" type="button" className={BUTTON}>
          hover
        </button>
        <button id="focus-me" type="button" className={BUTTON}>
          focus-visible
        </button>
      </div>
    </div>
  )
}

const BUTTON = cn(
  "bg-primary text-on-primary rounded-md px-4 py-2",
  "hover:bg-highlight hover:text-on-highlight",
  "focus-visible:outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
)
