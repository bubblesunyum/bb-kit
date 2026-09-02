import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AWKWARD } from "@/test/awkward-content"
import { HStack, VStack } from "./stack"
import { OutlineSurface, RaisedSurface, Surface } from "./surface"
import { H3, Text } from "./text"

/**
 * The box every other box is built on. Every story sits on a painted page, so
 * the card colour has something to be a different colour from — a surface shown
 * against Storybook's own background proves nothing. None of them pins a
 * palette or a mode; the toolbar supplies both.
 */
const meta = {
  component: Surface,
  decorators: [
    (Story) => (
      <div className="bg-page p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Surface>

export default meta

type Story = StoryObj<typeof meta>

/** All three forms side by side. This is the story that catches drift. */
export const Variants: Story = {
  render: () => (
    <HStack align="start" gap={4}>
      <Surface>
        <Sample>plain</Sample>
      </Surface>
      <OutlineSurface>
        <Sample>outline</Sample>
      </OutlineSurface>
      <RaisedSurface>
        <Sample>raised</Sample>
      </RaisedSurface>
    </HStack>
  ),
}

/** The default form: the card colour, a radius and padding, and nothing else. */
export const Defaults: Story = {
  render: () => (
    <Surface>
      <Sample>plain</Sample>
    </Surface>
  ),
}

/**
 * The clashing palette's light mode has a page darker than its cards and a
 * shadow that is black at six percent, so `raised` separates by colour rather
 * than by its shadow. Switch the palette in the toolbar with this story open:
 * all three forms have to stay visible as boxes in both.
 */
export const AgainstThePage: Story = {
  render: () => (
    <VStack gap={4}>
      <Text tone="quiet">Page behind, surfaces in front.</Text>
      <HStack align="start" gap={4}>
        <Surface>
          <Sample>plain</Sample>
        </Surface>
        <OutlineSurface>
          <Sample>outline</Sample>
        </OutlineSurface>
        <RaisedSurface>
          <Sample>raised</Sample>
        </RaisedSurface>
      </HStack>
    </VStack>
  ),
}

/** A surface inside a surface: the same colour, so the inner one needs an edge. */
export const Nested: Story = {
  render: () => (
    <RaisedSurface className="max-w-md">
      <VStack gap={3}>
        <H3>Outer</H3>
        <OutlineSurface>
          <Text tone="quiet">Inner, and only its border says so.</Text>
        </OutlineSurface>
      </VStack>
    </RaisedSurface>
  ),
}

/** The content that catches clipping: an unbreakable word has nothing to push against. */
export const AwkwardContent: Story = {
  render: () => (
    <HStack align="start" gap={4}>
      <OutlineSurface className="max-w-xs">
        <VStack gap={2}>
          <H3>{AWKWARD.longTitle}</H3>
          <Text tone="quiet">{AWKWARD.unbreakableWord}</Text>
        </VStack>
      </OutlineSurface>
      <RaisedSurface>
        <Text>{AWKWARD.oneCharacter}</Text>
      </RaisedSurface>
    </HStack>
  ),
}

/**
 * Padding and radius are defaults, not rules — a surface holding an image to
 * its own edges overrides both from outside, which is how every part of the kit
 * is meant to bend.
 */
export const Overridden: Story = {
  render: () => (
    <HStack align="start" gap={4}>
      <OutlineSurface className="p-0">
        <Text className="p-2">no padding, then padded inside</Text>
      </OutlineSurface>
      <RaisedSurface className="rounded-none">
        <Text>square corners</Text>
      </RaisedSurface>
    </HStack>
  ),
}

function Sample({ children }: { children: React.ReactNode }) {
  return (
    <VStack gap={1}>
      <H3>{children}</H3>
      <Text tone="quiet">A box with no meaning.</Text>
    </VStack>
  )
}
