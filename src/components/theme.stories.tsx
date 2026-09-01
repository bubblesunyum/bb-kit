import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Theme } from "./theme"

/**
 * §4.2's verifications, kept as stories rather than run once and thrown away.
 * Every one of them fails silently — a wrong @source path, a frozen token, a
 * half-and-half island — so the only way to know they still hold is to look.
 *
 * This file living in src/components is itself verification 2: if @source were
 * pointed at the wrong folder these classes would generate nothing at all.
 */
const meta = {
  component: Theme,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Theme>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Verification 5, the one nothing else renders: a dark page holding a light
 * island holding a clash island. Each level sets only what it changes and
 * inherits the rest, which is the whole reason mode rides on color-scheme
 * instead of a second attribute.
 */
export const Nesting: Story = {
  args: { palette: "forest", mode: "dark" },
  render: (args) => (
    <Theme {...args} className="p-6">
      <Label>forest dark — the page</Label>
      <Card>A card on the page.</Card>

      <Theme mode="light" className="mt-4 rounded-lg p-6">
        <Label>forest light — an island</Label>
        <Card>Its own background, or the dark page shows through behind this text.</Card>

        <Theme palette="clash" className="mt-4 rounded-lg p-6">
          <Label>clash — an island inside the island, inheriting light</Label>
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
      {["bg-primary", "bg-primary/75", "bg-primary/50", "bg-primary/25"].map((className) => (
        <div key={className} className={`${className} text-on-primary rounded-md px-4 py-6 text-sm`}>
          {className}
        </div>
      ))}
    </Theme>
  ),
}

/**
 * Verification 4. Tailwind's shadow utilities compose through internal
 * properties rather than emitting the variable directly, so the mode switch is
 * the part to distrust — the colour has to follow it, not freeze at build time.
 */
export const ShadowFollowsMode: Story = {
  args: {},
  render: (args) => (
    <Theme {...args} className="flex gap-6 p-10">
      {["shadow-xs", "shadow-sm", "shadow-md"].map((className) => (
        <div key={className} className={`bg-card ${className} rounded-lg px-6 py-8 text-sm`}>
          {className}
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
