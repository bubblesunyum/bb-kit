import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AWKWARD } from "@/test/awkward-content"
import { GhostButton } from "./button"
import { Card, CardBody, CardFooter, CardMedia, CardTitle } from "./card"
import { CardLink } from "./card-link"
import { HStack, VStack } from "./stack"
import { H3, Span, Text } from "./text"

/**
 * A whole card made clickable without wrapping it in an anchor. Point at any
 * part of the card below and the title underlines; the tag buttons in the
 * footer still take their own clicks.
 *
 * The accessibility addon's nested-interactive check would catch a wrongly
 * nested link — but only in a story that does the wrong thing, and nobody
 * writes those. What actually enforces the rule is that these examples use
 * `CardLink`, so the right pattern is the one that gets copied.
 */
const meta = {
  component: CardLink,
  decorators: [
    (Story) => (
      <div className="bg-page p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CardLink>

export default meta

type Story = StoryObj<typeof meta>

/** The normal case: a post card with tags. */
export const APostCard: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardMedia>
        <img src="/story-cover.svg" alt="" className="h-32" />
      </CardMedia>
      <CardTitle>
        <Span tone="quiet" size="sm">
          {AWKWARD.date}
        </Span>
        <H3>
          <CardLink href="#post">Writing components an agent can install</CardLink>
        </H3>
      </CardTitle>
      <CardBody>
        <Text tone="quiet" size="sm">
          The whole card is clickable, and the tags below are still their own
          buttons rather than part of the link.
        </Text>
      </CardBody>
      <CardFooter>
        <GhostButton size="sm">typescript</GhostButton>
        <GhostButton size="sm">react</GhostButton>
      </CardFooter>
    </Card>
  ),
}

/**
 * Focus, forced. Tabbing to the card outlines the whole card rather than the
 * title text, because the ring goes on the overlay — and the overlay is the
 * thing that is actually clickable.
 */
export const Focus: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardTitle>
        <H3>
          <CardLink href="#post">A card with the focus ring on it</CardLink>
        </H3>
      </CardTitle>
      <CardBody>
        <Text tone="quiet" size="sm">
          The ring follows the card's corners, not the title's box.
        </Text>
      </CardBody>
    </Card>
  ),
  parameters: { pseudo: { focusVisible: ["a"] } },
}

/** A row of them, which is what a list of posts actually looks like. */
export const ARowOfThem: Story = {
  render: () => (
    <HStack align="stretch" gap={4}>
      {["Lists that never truncate", "Filtering without a framework", AWKWARD.oneCharacter].map(
        (title) => (
          <Card key={title} className="max-w-56">
            <CardTitle>
              <H3 size="lg">
                <CardLink href="#post">{title}</CardLink>
              </H3>
            </CardTitle>
            <CardBody>
              <Text tone="quiet" size="sm">
                Body copy.
              </Text>
            </CardBody>
            <CardFooter>
              <GhostButton size="sm">design</GhostButton>
            </CardFooter>
          </Card>
        ),
      )}
    </HStack>
  ),
}

/**
 * Without a `Card` around it there is nothing positioned for the overlay to
 * cover, so it stretches to the nearest positioned ancestor instead. That is
 * why `Card` is what sets `position: relative` and `CardLink` is not.
 */
export const NeedsACardAroundIt: Story = {
  render: () => (
    <VStack align="start" gap={4}>
      <Card className="max-w-64">
        <CardTitle>
          <H3>
            <CardLink href="#post">Inside a card — the overlay covers the card</CardLink>
          </H3>
        </CardTitle>
      </Card>
      <div className="bg-card relative max-w-64 rounded-lg p-4">
        <H3>
          <CardLink href="#post">Inside any positioned box — it covers that instead</CardLink>
        </H3>
      </div>
    </VStack>
  ),
}
