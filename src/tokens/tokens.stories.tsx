import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { palettes, ROLES, type PaletteName } from "./palette"

/**
 * Step 0's proof that the chain works end to end: the generated token CSS
 * reaches the canvas, `data-theme` and `data-mode` select a palette and a mode,
 * and the pseudo-states addon can force a state that no pointer is producing.
 *
 * Step 2 (bbk-bp6.8) builds the real `/tokens` page, with every §4.6 pair and
 * its measured contrast number. This one only shows that the plumbing is live.
 */
const meta: Meta<typeof Swatches> = {
  title: "Tokens/Roles",
  component: Swatches,
}

export default meta

export const Forest: StoryObj<typeof Swatches> = { args: { palette: "forest" } }

export const Clash: StoryObj<typeof Swatches> = { args: { palette: "clash" } }

/** Forced, because only one element on a page can hold focus at a time. */
export const FocusedAndHovered: StoryObj<typeof Swatches> = {
  args: { palette: "forest" },
  parameters: { pseudo: { hover: "#hover-me", focusVisible: "#focus-me" } },
}

function Swatches({ palette }: { palette: PaletteName }) {
  return (
    <div style={{ display: "flex", gap: 24 }}>
      {MODES.map((mode) => (
        <div
          key={mode}
          data-theme={palette}
          data-mode={mode}
          style={{ background: "var(--page)", color: "var(--text)", padding: 24, flex: 1 }}
        >
          <p style={{ marginBottom: 16 }}>{mode}</p>
          {ROLES.map((role) => (
            <div key={role} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  background: `var(--${role})`,
                  border: "1px solid var(--border)",
                }}
              />
              <code>{role}</code>
              <code style={{ color: "var(--quiet)" }}>{palettes[palette][role][mode]}</code>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button id="hover-me" type="button" style={BUTTON}>
              hover
            </button>
            <button id="focus-me" type="button" style={BUTTON}>
              focus-visible
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

const MODES = ["light", "dark"] as const

const BUTTON = {
  background: "var(--primary)",
  color: "var(--text-on-primary)",
  border: "none",
  padding: "8px 16px",
}
