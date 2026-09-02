import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Separator } from "./separator"
import { HStack, VStack } from "./stack"
import { Text } from "./text"

/**
 * A real dividing line — not a border on a neighbour. Horizontal by default,
 * vertical when asked. Neither pins a palette or a mode; the toolbar supplies
 * both.
 */
const meta = {
  component: Separator,
} satisfies Meta<typeof Separator>

export default meta

type Story = StoryObj<typeof meta>

/** A hairline across. */
export const Horizontal: Story = {
  render: () => (
    <VStack gap={4} className="max-w-sm">
      <Text>Above</Text>
      <Separator />
      <Text tone="quiet">Below, with a border-role line between them.</Text>
    </VStack>
  ),
}

/** A hairline tall, inside a row. Needs a height from its parent. */
export const Vertical: Story = {
  render: () => (
    <HStack gap={4} className="h-12 max-w-sm">
      <Text>Left</Text>
      <Separator orientation="vertical" />
      <Text tone="quiet">Right, with a vertical line between them.</Text>
    </HStack>
  ),
}

/** Both, so the thickness reads against the page in either direction. */
export const Both: Story = {
  render: () => (
    <VStack gap={6} className="max-w-sm">
      <VStack gap={3}>
        <Text tone="quiet" size="sm">horizontal</Text>
        <Separator />
      </VStack>
      <HStack gap={3} className="h-10">
        <Text tone="quiet" size="sm">vertical</Text>
        <Separator orientation="vertical" />
        <Text tone="quiet" size="sm">between</Text>
        <Separator orientation="vertical" />
        <Text tone="quiet" size="sm">items</Text>
      </HStack>
    </VStack>
  ),
}

/**
 * Overridable from outside, like every other part of the kit — a thicker line
 * or a muted one without adding a prop for it.
 */
export const Overridden: Story = {
  render: () => (
    <VStack gap={4} className="max-w-sm">
      <Text tone="quiet" size="sm">thicker and muted</Text>
      <Separator className="bg-muted h-0.5" />
    </VStack>
  ),
}
