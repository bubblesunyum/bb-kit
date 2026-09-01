import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { AWKWARD } from "@/test/awkward-content"
import { HStack, VStack } from "./stack"
import { Text } from "./text"

/**
 * The two layout primitives everything else is built on. Every story leaves
 * palette and mode to the toolbar, so four-up shows each of them against both
 * palettes in both modes at once.
 */
const meta = {
  component: VStack,
} satisfies Meta<typeof VStack>

export default meta

type Story = StoryObj<typeof meta>

/** Both with nothing asked for: 8px between children, and that is all. */
export const Defaults: Story = {
  render: () => (
    <VStack gap={6}>
      <VStack>
        <Text weight="medium">VStack</Text>
        <Box>one</Box>
        <Box>two</Box>
        <Box>three</Box>
      </VStack>
      <VStack>
        <Text weight="medium">HStack</Text>
        <HStack>
          <Box>one</Box>
          <Box>two</Box>
          <Box>three</Box>
        </HStack>
      </VStack>
    </VStack>
  ),
}

/** Tailwind's scale, so `gap={2}` is 8px and nothing here invents a second one. */
export const Gaps: Story = {
  render: () => (
    <VStack gap={4}>
      {GAPS.map((gap) => (
        <VStack key={gap} gap={1}>
          <Text size="sm" tone="quiet">
            gap={gap}
          </Text>
          <HStack gap={gap}>
            <Box>one</Box>
            <Box>two</Box>
            <Box>three</Box>
          </HStack>
        </VStack>
      ))}
    </VStack>
  ),
}

/** Across the stack's own direction. A VStack stretches its children by default. */
export const Align: Story = {
  render: () => (
    <VStack gap={4}>
      {ALIGNS.map((align) => (
        <VStack key={align} gap={1}>
          <Text size="sm" tone="quiet">
            align={align}
          </Text>
          <HStack align={align} className="border-border h-32 border p-2">
            <Box>short</Box>
            <Box className="py-6">taller</Box>
            <Box className="py-8">tallest</Box>
          </HStack>
        </VStack>
      ))}
    </VStack>
  ),
}

/** Along it. This is the one that needs room left over to show anything. */
export const Justify: Story = {
  render: () => (
    <VStack gap={4}>
      {JUSTIFIES.map((justify) => (
        <VStack key={justify} gap={1}>
          <Text size="sm" tone="quiet">
            justify={justify}
          </Text>
          <HStack justify={justify} className="border-border border">
            <Box>one</Box>
            <Box>two</Box>
          </HStack>
        </VStack>
      ))}
    </VStack>
  ),
}

/**
 * The content that catches clipping. A row of an unbreakable word beside a
 * button is where a stack pushes its container wider than the page, so the
 * frame here is deliberately narrow.
 */
export const AwkwardContent: Story = {
  render: () => (
    <VStack gap={3} className="border-border max-w-sm border p-3">
      <Text weight="medium">{AWKWARD.longTitle}</Text>
      <HStack>
        <Text className="min-w-0">{AWKWARD.unbreakableWord}</Text>
        <Box>fixed</Box>
      </HStack>
      <HStack justify="between">
        <Text tone="quiet">{AWKWARD.oneCharacter}</Text>
        <Text tone="quiet">{AWKWARD.date}</Text>
      </HStack>
    </VStack>
  ),
}

/** Something with an edge, so a gap and an alignment are visible at all. */
function Box({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-card border-border text-text rounded-sm border px-3 py-2 text-sm", className)}
      {...props}
    />
  )
}

const GAPS = [0, 1, 2, 4, 8] as const
const ALIGNS = ["start", "center", "end", "stretch", "baseline"] as const
const JUSTIFIES = ["start", "center", "end", "between", "around", "evenly"] as const
