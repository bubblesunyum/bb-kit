import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { cn } from "@/lib/utils"
import { Theme } from "./theme"

/**
 * §4.2's verifications, kept as stories rather than run once and thrown away.
 * Every one of them fails silently — a wrong @source path, a frozen token, a
 * half-and-half island — so the only way to know they still hold is to look.
 * Verification 4, the shadow, lives in Tokens/Shadows.
 *
 * This file living in src/components is itself verification 2: if @source were
 * pointed at the wrong folder these classes would generate nothing at all.
 */
const meta = {
  component: Theme,
} satisfies Meta<typeof Theme>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Verification 5, the one nothing else renders: a page holding an island that
 * overrides only the mode, holding an island that overrides only the palette.
 * Each level sets one half and inherits the other, which is the whole reason
 * mode rides on color-scheme instead of a second attribute.
 *
 * The outer level takes the toolbar rather than pinning a palette and mode, so
 * the nesting can be checked from all four starting points — and four-up shows
 * every one of them at once. Only the two inner overrides are fixed, because
 * they are the subject.
 */
export const Nesting: Story = {
  args: {},
  render: (args) => (
    <Theme {...args} className="p-6">
      <Label>the page — whatever the toolbar says</Label>
      <Card>A card on the page.</Card>

      <Theme mode="light" className="mt-4 rounded-lg p-6">
        <Label>an island forcing light, palette inherited</Label>
        <Card>Its own background, or the page shows through behind this text.</Card>

        <Theme palette="clash" className="mt-4 rounded-lg p-6">
          <Label>an island forcing clash, mode inherited from the island above</Label>
          <Card>Palette changed, mode inherited.</Card>
        </Theme>
      </Theme>
    </Theme>
  ),
}

/**
 * Verification 3. An opacity modifier compiles to a color-mix around the
 * variable, and mixing a light-dark() value is a newer combination than either
 * feature alone. Each swatch must stay visibly lighter than the one before it,
 * in every palette and mode.
 */
export const OpacityModifier: Story = {
  // No palette or mode: these inherit the toolbar, so four-up shows the ramp in
  // all four combinations at once rather than four copies of the same one.
  args: {},
  render: (args) => (
    <Theme {...args} className="flex gap-3 p-6">
      {["bg-primary", "bg-primary/75", "bg-primary/50", "bg-primary/25"].map((utility) => (
        <div key={utility} className={cn(utility, "text-on-primary rounded-md px-4 py-6 text-sm")}>
          {utility}
        </div>
      ))}
    </Theme>
  ),
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-card border-border rounded-md border p-4 shadow-sm">{children}</div>
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-quiet mb-2 text-xs tracking-wide uppercase">{children}</p>
}
