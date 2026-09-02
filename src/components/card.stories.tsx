import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AWKWARD } from "@/test/awkward-content"
import { GhostButton, PrimaryButton } from "./button"
import { Card, CardBody, CardFooter, CardMedia, CardTitle } from "./card"
import { HStack, VStack } from "./stack"
import { H3, Span, Text } from "./text"

/**
 * A standalone box with content parts, raised by default. A row inside a list
 * is a `ListItem` instead — same parts, different wrapper — because a list row
 * is only valid inside a list.
 *
 * `CardTitle` renders no heading. Every story here puts an `H3` inside it, at
 * the level a real page would want, which is the whole point.
 */
const meta = {
  component: Card,
  decorators: [
    (Story) => (
      <div className="bg-page p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

/** The whole thing: cover, title, body, footer. What a post card looks like. */
export const Everything: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardMedia>
        <img src={COVER} alt="" className="h-40" />
      </CardMedia>
      <CardTitle>
        <Span tone="quiet" size="sm">
          {AWKWARD.date}
        </Span>
        <H3>Writing components an agent can install</H3>
      </CardTitle>
      <CardBody>
        <Text tone="quiet">
          The parts are separate so a card without one is the same card with a
          part left out, rather than a different component.
        </Text>
      </CardBody>
      <CardFooter>
        <PrimaryButton size="sm">Read</PrimaryButton>
        <GhostButton size="sm">Share</GhostButton>
      </CardFooter>
    </Card>
  ),
}

/** Every part is optional by being absent, not by being switched off — Rule 2. */
export const Parts: Story = {
  render: () => (
    <HStack align="start" gap={4} className="flex-wrap">
      <Card className="max-w-64">
        <CardTitle>
          <H3>Title only</H3>
        </CardTitle>
      </Card>
      <Card className="max-w-64">
        <CardTitle>
          <H3>Title and body</H3>
        </CardTitle>
        <CardBody>
          <Text tone="quiet">A short summary of what this one is about.</Text>
        </CardBody>
      </Card>
      <Card className="max-w-64">
        <CardMedia>
          <img src={COVER} alt="" className="h-24" />
        </CardMedia>
        <CardTitle>
          <H3>Cover and title</H3>
        </CardTitle>
      </Card>
    </HStack>
  ),
}

/** The forms come from `Surface`, so a card cannot drift from a plain box. */
export const Forms: Story = {
  render: () => (
    <HStack align="start" gap={4}>
      {(["raised", "outline", "plain"] as const).map((variant) => (
        <Card key={variant} variant={variant} className="max-w-56">
          <CardTitle>
            <H3>{variant}</H3>
          </CardTitle>
          <CardBody>
            <Text tone="quiet" size="sm">
              Raised is the default, because a card is usually standing on its own.
            </Text>
          </CardBody>
        </Card>
      ))}
    </HStack>
  ),
}

/**
 * `Surface` owns the card's padding, so the media reaches the edges by
 * cancelling it. Which edges depend on where it sits: first it takes the top,
 * last it takes the bottom, on its own it takes both.
 */
export const MediaAtEitherEnd: Story = {
  render: () => (
    <HStack align="start" gap={4}>
      <Card className="max-w-56">
        <CardMedia>
          <img src={COVER} alt="" className="h-24" />
        </CardMedia>
        <CardTitle>
          <H3>Cover on top</H3>
        </CardTitle>
      </Card>
      <Card className="max-w-56">
        <CardTitle>
          <H3>Cover underneath</H3>
        </CardTitle>
        <CardMedia>
          <img src={COVER} alt="" className="h-24" />
        </CardMedia>
      </Card>
      <Card className="max-w-56">
        <CardMedia>
          <img src={COVER} alt="" className="h-24" />
        </CardMedia>
      </Card>
    </HStack>
  ),
}

/**
 * Cards side by side at the same height: the body takes the leftover space, so
 * the footers line up however much the titles differ.
 */
export const FootersLineUp: Story = {
  render: () => (
    <HStack align="stretch" gap={4}>
      {[AWKWARD.longTitle, "Short", "A middling sort of title"].map((title) => (
        <Card key={title} className="max-w-56">
          <CardTitle>
            <H3 size="lg">{title}</H3>
          </CardTitle>
          <CardBody>
            <Text tone="quiet" size="sm">
              Body copy.
            </Text>
          </CardBody>
          <CardFooter>
            <PrimaryButton size="sm">Read</PrimaryButton>
          </CardFooter>
        </Card>
      ))}
    </HStack>
  ),
}

/** The content that catches clipping: nothing here may leave the card. */
export const AwkwardContent: Story = {
  render: () => (
    <HStack align="start" gap={4}>
      <Card className="max-w-56">
        <CardTitle>
          <H3>{AWKWARD.longTitle}</H3>
        </CardTitle>
        <CardBody>
          <Text tone="quiet" size="sm">
            {AWKWARD.unbreakableWord}
          </Text>
        </CardBody>
      </Card>
      <Card className="max-w-56">
        <CardTitle>
          <H3>{AWKWARD.oneCharacter}</H3>
        </CardTitle>
      </Card>
    </HStack>
  ),
}

/** A card that is entirely a link and has nothing else clickable in it. */
export const AsAnElementOfItsOwn: Story = {
  render: () => (
    <VStack align="start" gap={4}>
      <Card asChild className="max-w-64">
        <a href="#somewhere">
          <CardTitle>
            <H3>A card that is an anchor</H3>
          </CardTitle>
          <CardBody>
            <Text tone="quiet" size="sm">
              Use this only when nothing inside the card is clickable too. When
              anything is — a tag, a button — reach for CardLink instead.
            </Text>
          </CardBody>
        </a>
      </Card>
    </VStack>
  ),
}

// Wider than any card it lands in, so object-cover has something to crop.
const COVER = "/story-cover.svg"
