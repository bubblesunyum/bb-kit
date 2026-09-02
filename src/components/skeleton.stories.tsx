import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Skeleton } from "./skeleton"
import { HStack, VStack } from "./stack"
import { Text } from "./text"

/**
 * A placeholder for content that has not arrived yet. The caller picks the
 * size, because only they know the height the real content will take — a
 * paragraph is taller than a badge, and a card is taller than either.
 *
 * Animation holds still for readers who asked for reduced motion, through a
 * CSS media query rather than a JS hook — so the component stays server-
 * renderable. None of these stories pins a palette or a mode; the toolbar
 * supplies both.
 */
const meta = {
  component: Skeleton,
} satisfies Meta<typeof Skeleton>

export default meta

type Story = StoryObj<typeof meta>

/** A single bar — the default, one line, full width, 16px tall. */
export const Single: Story = {
  render: () => <Skeleton className="max-w-sm" />,
}

/** Several lines, like a paragraph. The last is shorter to read as text. */
export const Lines: Story = {
  render: () => (
    <VStack gap={6} className="max-w-sm">
      <VStack gap={2}>
        <Text tone="quiet" size="sm">3 lines</Text>
        <Skeleton lines={3} />
      </VStack>
      <VStack gap={2}>
        <Text tone="quiet" size="sm">5 lines</Text>
        <Skeleton lines={5} />
      </VStack>
    </VStack>
  ),
}

/** Width and height are any CSS length — or a number as px. */
export const Sized: Story = {
  render: () => (
    <VStack gap={4} className="max-w-sm">
      <VStack gap={2}>
        <Text tone="quiet" size="sm">width 200px</Text>
        <Skeleton width="200px" />
      </VStack>
      <VStack gap={2}>
        <Text tone="quiet" size="sm">height 24px</Text>
        <Skeleton height={24} />
      </VStack>
      <VStack gap={2}>
        <Text tone="quiet" size="sm">200 x 48, like an image</Text>
        <Skeleton width={200} height={48} />
      </VStack>
      <VStack gap={2}>
        <Text tone="quiet" size="sm">lines 3, height 12px</Text>
        <Skeleton lines={3} height="12px" />
      </VStack>
    </VStack>
  ),
}

/** The same shape beside real content: the bar is the height the text will be. */
export const BesideText: Story = {
  render: () => (
    <VStack gap={4} className="max-w-sm">
      <Text>Real text, 16px, line height 1.5.</Text>
      <Skeleton />
      <Text tone="quiet" size="sm">Skeleton above is h-4 (16px) by default — the line height is set by the gap around it, not the bar itself. Pick the height that matches the content you are holding.</Text>
    </VStack>
  ),
}

/**
 * Every part of the kit is overridable from outside. A skeleton holding an
 * image to its edges removes the radius; one inside a muted panel tints itself.
 */
export const Overridden: Story = {
  render: () => (
    <HStack gap={4} className="max-w-sm">
      <Skeleton className="rounded-none" width={80} height={80} />
      <Skeleton className="bg-border" />
    </HStack>
  ),
}
