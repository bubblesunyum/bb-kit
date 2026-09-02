import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AWKWARD } from "@/test/awkward-content"
import { GhostButton, PrimaryButton } from "./button"
import { CardBody, CardFooter, CardTitle } from "./card"
import { CardLink } from "./card-link"
import { EmptyState } from "./empty-state"
import { List } from "./list"
import { HStack } from "./stack"
import { H2, H3, Text } from "./text"

// Above the meta rather than at the foot of the file, where the rest of this
// kit's helpers live: the meta's default args read them while the module is
// still evaluating, and a const below would still be in its temporal dead zone.
function renderPost(post: Post) {
  return (
    <>
      <CardTitle>
        <H3 size="lg">{post.title}</H3>
      </CardTitle>
      <CardBody>
        <Text tone="quiet" size="sm">
          {post.excerpt}
        </Text>
      </CardBody>
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
  {
    title: "Two settings that move independently",
    excerpt: "Palette and mode, one attribute each, and light-dark() doing the work.",
    tag: "css",
  },
]

const MANY: Post[] = Array.from({ length: 40 }, (_, i) => ({
  title: `Post number ${i + 1}`,
  excerpt: "One of forty, and all forty are here.",
  tag: "design",
}))

/**
 * A list of posts, in every state it can be in. The thing to check here is that
 * the header stays put and the block keeps a list-shaped height as you move
 * between them — the old kit's list dropped both while loading.
 */
const meta = {
  component: List,
  // Defaults every story starts from, so each one below says only what it
  // changes — which is the state it exists to show.
  args: { items: POSTS, getKey: (post: Post) => post.title, renderItem: renderPost },
  decorators: [
    (Story) => (
      <div className="bg-page max-w-md p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof List<Post>>

export default meta

type Story = StoryObj<typeof meta>

/** The ordinary case. */
export const Defaults: Story = {}

/** With a header, which every state below keeps. */
export const WithAHeader: Story = {
  args: { header: <H2 size="xl">Posts</H2> },
}

/** Placeholder rows, and the header still above them. */
export const Loading: Story = {
  args: { header: <H2 size="xl">Posts</H2>, loading: true, items: [] },
}

/** `List` owns this one, because unlike a stack it can tell empty from absent. */
export const Empty: Story = {
  args: {
    header: <H2 size="xl">Posts</H2>,
    items: [],
    empty: (
      <EmptyState
        title="No posts yet"
        description="Once something is published it will show up here."
        action={<PrimaryButton size="sm">Write one</PrimaryButton>}
      />
    ),
  },
}

/** An error wins over loading: it is worth saying even mid-refresh. */
export const Failed: Story = {
  args: {
    header: <H2 size="xl">Posts</H2>,
    loading: true,
    error: <Text tone="danger">Could not load posts. Try again in a moment.</Text>,
    items: [],
  },
}

/** It never truncates. Forty rows are forty rows. */
export const ItNeverTruncates: Story = {
  args: { header: <H2 size="xl">Forty posts</H2>, items: MANY },
}

/** Rows that are entirely links, which is what a list of posts usually is. */
export const ClickableRows: Story = {
  render: () => (
    <List
      header={<H2 size="xl">Posts</H2>}
      items={POSTS}
      getKey={(post) => post.title}
      renderItem={(post) => (
      <>
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
        </>
      )}
    />
  ),
}

/** The gap is Tailwind's scale, not a second one. */
export const Gaps: Story = {
  render: () => (
    <HStack align="start" gap={6}>
      {([0, 2, 6] as const).map((gap) => (
        <List
          key={gap}
          header={<Text tone="quiet" size="sm">{`gap ${gap}`}</Text>}
          gap={gap}
          items={POSTS}
          getKey={(post) => post.title}
          renderItem={(post) => <Text size="sm">{post.title}</Text>}
        />
      ))}
    </HStack>
  ),
}

/** Nothing may leave a row, and the shortest row is still a row. */
export const AwkwardContent: Story = {
  args: {
    items: [
      { title: AWKWARD.longTitle, excerpt: AWKWARD.unbreakableWord, tag: "css" },
      { title: AWKWARD.oneCharacter, excerpt: "", tag: "css" },
    ],
  },
}
