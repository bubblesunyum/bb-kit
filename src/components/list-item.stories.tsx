import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AWKWARD } from "@/test/awkward-content"
import { GhostButton } from "./button"
import { CardBody, CardFooter, CardTitle } from "./card"
import { CardLink } from "./card-link"
import { CardListItem, ListItem } from "./list-item"
import { HStack } from "./stack"
import { H3, Span, Text } from "./text"

/**
 * One row inside a list. It is an `<li>`, so it is only valid inside one — a
 * box that stands on its own is a `Card` instead.
 *
 * `List` is what supplies the `<ul>` and the gap between rows. These stories
 * write the `<ul>` by hand, because the point here is the row.
 */
const meta = {
  component: ListItem,
  decorators: [
    (Story) => (
      <div className="bg-page p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListItem>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Plain against raised. A list of plain rows reads as one thing; a list of
 * raised rows reads as a stack of cards, which is why plain is the default.
 */
export const Forms: Story = {
  render: () => (
    <HStack align="start" gap={6}>
      <Rows title="plain — the default">
        {POSTS.map((post) => (
          <ListItem key={post.title}>
            <Row {...post} />
          </ListItem>
        ))}
      </Rows>
      <Rows title="CardListItem — raised">
        {POSTS.map((post) => (
          <CardListItem key={post.title}>
            <Row {...post} />
          </CardListItem>
        ))}
      </Rows>
    </HStack>
  ),
}

/** The plain default on its own, at the width a column of rows actually takes. */
export const Defaults: Story = {
  render: () => (
    <ul className="flex max-w-md flex-col gap-2">
      {POSTS.map((post) => (
        <ListItem key={post.title}>
          <Row {...post} />
        </ListItem>
      ))}
    </ul>
  ),
}

/**
 * A row is exactly as likely to be entirely a link as a card is, so the row is
 * positioned too and `CardLink` works inside it unchanged. Two states are
 * forced here: the ring on the first row lands on the row rather than the
 * title, and the second row wears the highlight tint the pointer would give it.
 */
export const ClickableRows: Story = {
  render: () => (
    <ul className="flex max-w-md flex-col gap-2">
      {POSTS.map((post) => (
        <CardListItem key={post.title}>
          <CardTitle>
            <H3 size="lg">
              <CardLink href="#post">{post.title}</CardLink>
            </H3>
          </CardTitle>
          <CardBody>
            <Text tone="quiet" size="sm">
              {post.excerpt}
            </Text>
          </CardBody>
          <CardFooter>
            <GhostButton size="sm">{post.tag}</GhostButton>
          </CardFooter>
        </CardListItem>
      ))}
    </ul>
  ),
  parameters: {
    pseudo: { focusVisible: ["li:first-child a"], hover: ["li:nth-child(2)"] },
  },
}

/** Nothing may leave the row, however little or much is in it. */
export const AwkwardContent: Story = {
  render: () => (
    <ul className="flex max-w-md flex-col gap-2">
      <CardListItem>
        <Row title={AWKWARD.longTitle} excerpt={AWKWARD.unbreakableWord} tag="css" />
      </CardListItem>
      <CardListItem>
        <Row title={AWKWARD.oneCharacter} excerpt="" tag="css" />
      </CardListItem>
    </ul>
  ),
}

function Rows({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex max-w-xs flex-col gap-2">
      <Span tone="quiet" size="sm">
        {title}
      </Span>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  )
}

function Row({ title, excerpt, tag }: Post) {
  return (
    <>
      <CardTitle>
        <H3 size="lg">{title}</H3>
      </CardTitle>
      <CardBody>
        <Text tone="quiet" size="sm">
          {excerpt}
        </Text>
      </CardBody>
      <CardFooter>
        <GhostButton size="sm">{tag}</GhostButton>
      </CardFooter>
    </>
  )
}

type Post = { title: string; excerpt: string; tag: string }

const POSTS: Post[] = [
  {
    title: "Lists that never truncate",
    excerpt: "The old one silently rendered the first three items and nothing else.",
    tag: "react",
  },
  {
    title: "Filtering without a framework",
    excerpt: "Three plain functions and one hook that delays only the filtering.",
    tag: "typescript",
  },
]
