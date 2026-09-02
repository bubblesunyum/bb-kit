import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AWKWARD } from "@/test/awkward-content"
import { Badge } from "./badge"
import { HStack, VStack } from "./stack"
import { H4, Text } from "./text"

/**
 * A pill that is a real button. There is no variant — unselected and selected
 * are states, so the two stories that matter are next to each other rather
 * than under different names.
 *
 * No story pins a palette or a mode; the toolbar supplies both. Switch to the
 * clashing palette with the Selection story open: the two states have to stay
 * tellable apart there too.
 */
const meta = {
  component: Badge,
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

/** The default: unselected, medium, and nothing asked for. */
export const Defaults: Story = {
  render: () => <Badge>Design</Badge>,
}

/**
 * The whole component in one line. Selected is filled with the primary colour
 * rather than a tint — no tint reaches the 3:1 a control's state needs — and
 * the weight changes with it, so the two do not differ by hue alone.
 */
export const Selection: Story = {
  render: () => (
    <HStack align="center" gap={3}>
      <Badge>Unselected</Badge>
      <Badge selected>Selected</Badge>
    </HStack>
  ),
}

/** A row of tags behaving as the filter they exist for. */
export const AsATagFilter: Story = {
  render: () => <TagFilter />,
}

/** 32, 40 and 48px — the same heights as Button, so a mixed row lines up. */
export const Sizes: Story = {
  render: () => (
    <VStack gap={4}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <HStack key={size} align="center" gap={3}>
          <Text tone="quiet" size="sm" className="w-8">
            {size}
          </Text>
          <Badge size={size}>Design</Badge>
          <Badge size={size} selected>
            Design
          </Badge>
        </HStack>
      ))}
    </VStack>
  ),
}

/**
 * Rest, hover, press, focus and disabled, in both states at once. Only one
 * element on a page can hold focus, so the states are forced — and the forced
 * state is `focus-visible`, never `focus`: asking for `focus` shows nothing,
 * and the natural wrong fix puts a ring on every mouse click.
 */
export const States: Story = {
  render: () => (
    <VStack gap={5}>
      {STATES.map(({ label, className, disabled }) => (
        <VStack key={label} gap={2}>
          <H4 size="sm">{label}</H4>
          <HStack align="center" gap={3} className={className}>
            <Badge disabled={disabled}>Unselected</Badge>
            <Badge disabled={disabled} selected>
              Selected
            </Badge>
          </HStack>
        </VStack>
      ))}
    </VStack>
  ),
  parameters: {
    pseudo: {
      hover: [".state-hover button"],
      active: [".state-active button"],
      focusVisible: [".state-focus button"],
    },
  },
}

/**
 * The ring sits outside the badge, so the gap shows whatever is behind it. A
 * tag row appears on the page and inside a card, and both have to keep it.
 */
export const FocusOnEitherBackground: Story = {
  render: () => (
    <HStack align="center" gap={4}>
      <div className="bg-page rounded-lg p-4">
        <Badge>On the page</Badge>
      </div>
      <div className="bg-card rounded-lg p-4">
        <Badge selected>On a card</Badge>
      </div>
    </HStack>
  ),
  parameters: { pseudo: { focusVisible: ["button"] } },
}

/**
 * Tags come from whatever wrote the post, so a badge gets given words nobody
 * sized it for. The height is a minimum and the label breaks anywhere, so a
 * long one grows the pill rather than escaping it.
 */
export const AwkwardContent: Story = {
  render: () => (
    <VStack align="start" gap={4}>
      <Badge className="max-w-sm">{AWKWARD.longTitle}</Badge>
      <Badge className="max-w-sm" selected>
        {AWKWARD.unbreakableWord}
      </Badge>
      <Badge>{AWKWARD.oneCharacter}</Badge>
    </VStack>
  ),
}

/** Every part bends from outside — Rule 6. */
export const Overridden: Story = {
  render: () => (
    <HStack align="center" gap={3}>
      <Badge className="rounded-md">Square ends</Badge>
      <Badge className="min-h-6 px-2 py-0 text-xs">Smaller than sm</Badge>
    </HStack>
  ),
}

/** The caller owns which tags are on; the badge only asks for the opposite. */
function TagFilter() {
  const [selected, setSelected] = useState<readonly string[]>(["Design"])

  return (
    <VStack align="start" gap={3}>
      <HStack align="center" gap={2} className="flex-wrap">
        {TAGS.map((tag) => (
          <Badge
            key={tag}
            selected={selected.includes(tag)}
            onSelectedChange={(next) =>
              setSelected((tags) => (next ? [...tags, tag] : tags.filter((it) => it !== tag)))
            }
          >
            {tag}
          </Badge>
        ))}
      </HStack>
      <Text tone="quiet" size="sm">
        {selected.length ? selected.join(", ") : "nothing selected"}
      </Text>
    </VStack>
  )
}

// The addon matches by selector, so each row carries the class its rule names.
const STATES: readonly { label: string; className: string; disabled?: boolean }[] = [
  { label: "rest", className: "state-rest" },
  { label: "hover", className: "state-hover" },
  { label: "press", className: "state-active" },
  { label: "focus-visible", className: "state-focus" },
  { label: "disabled", className: "state-disabled", disabled: true },
]

const TAGS = ["Design", "Engineering", "Writing", "Research", "Process"] as const
