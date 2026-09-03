import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { List } from "@/components/list"
import { VStack } from "@/components/stack"
import { Text } from "@/components/text"
import { awkwardPosts } from "@/test/awkward-content"

import { PostCard, PostRow, type Post } from "./post"

// Above the meta rather than with the other constants at the bottom: the meta
// reads it while the module evaluates, and a const below would still be in its
// temporal dead zone.
const POST: Post = {
  href: "#",
  title: "Designing tokens that survive a redesign",
  excerpt:
    "Roles, not colours. A token named for where it is used outlives the palette it was drawn from, and a token named for its hue does not.",
  tags: ["design", "css", "tokens"],
  date: "2026-03-14",
  cover: "/story-cover.svg",
}

/**
 * **Examples, not components.** A post has a cover, a title, a date, tags and
 * an excerpt, and that shape belongs to your site rather than to a UI kit — so
 * these ship as something to copy and edit.
 *
 * Two of them, out of the same pieces, which is what proves the pieces
 * recombine. `PostCard` stands on its own; `PostRow` renders the contents of a
 * row and goes straight into a `List`'s `renderItem`.
 *
 * No story pins a palette or a mode; the toolbar supplies both.
 */
const meta = {
  component: PostCard,
  args: { post: POST },
} satisfies Meta<typeof PostCard>

export default meta

type Story = StoryObj<typeof meta>

/** The card: cover, title, date, excerpt, tags. The whole card is clickable. */
export const Card: Story = {
  render: () => (
    <div className="w-96">
      <PostCard post={POST} />
    </div>
  ),
}

/** The row, in the `List` it is built for. */
export const Row: Story = {
  render: () => (
    <div className="w-160">
      <List items={POSTS} getKey={(post) => post.href} renderItem={(post) => <PostRow post={post} />} />
    </div>
  ),
}

/** Both shapes side by side — the same five fields, arranged twice. */
export const BothShapes: Story = {
  render: () => (
    <VStack gap={8} className="w-160">
      <div className="w-96">
        <PostCard post={POST} />
      </div>
      <List items={[POST]} getKey={(post) => post.href} renderItem={(post) => <PostRow post={post} />} />
    </VStack>
  ),
}

/**
 * A post with no cover and no date. Both are optional in the shape, and each
 * layout leaves out what is missing rather than holding a space for it.
 */
export const Sparse: Story = {
  render: () => (
    <VStack gap={8} className="w-160">
      <div className="w-96">
        <PostCard post={SPARSE} />
      </div>
      <List items={[SPARSE]} getKey={(post) => post.href} renderItem={(post) => <PostRow post={post} />} />
    </VStack>
  ),
}

/**
 * A grid of cards, which is what a post list usually is. The cards are the same
 * height in a row because the grid stretches them, and the tags stay along the
 * bottom because `CardBody` takes the leftover height.
 */
export const AGridOfCards: Story = {
  render: () => (
    <div className="grid w-240 grid-cols-3 gap-4">
      {POSTS.map((post) => (
        <PostCard key={post.href} post={post} />
      ))}
    </div>
  ),
}

/**
 * Empty, two hundred characters, one unbreakable word, and a tag row that has
 * to wrap twice — in both shapes, at a narrow width.
 */
export const AwkwardContent: Story = {
  render: () => (
    <VStack gap={8} className="w-96">
      {awkwardPosts().map((post) => (
        <PostCard key={post.href} post={post} />
      ))}
      <List
        items={awkwardPosts()}
        getKey={(post) => post.href}
        renderItem={(post) => <PostRow post={post} />}
      />
    </VStack>
  ),
}

/**
 * Focus, forced. The ring goes round the whole card rather than the title,
 * because the card is the thing that is clickable. `focus-visible`, never
 * `focus`.
 */
export const Focused: Story = {
  render: () => (
    <VStack gap={8} className="w-160">
      <div className="w-96">
        <PostCard post={POST} />
      </div>
      <List items={[POST]} getKey={(post) => post.href} renderItem={(post) => <PostRow post={post} />} />
    </VStack>
  ),
  parameters: { pseudo: { focusVisible: ["[data-slot=card-link]"] } },
}

/** A reminder of what these are: source to copy, not API to configure. */
export const NotAComponent: Story = {
  render: () => (
    <VStack gap={4} className="w-96">
      <Text tone="quiet" size="sm">
        These two are examples. Copy the file, delete the half you do not want, and change the rest —
        they become a real component only once the same shape has held up across three separate uses.
      </Text>
      <PostCard post={POST} />
    </VStack>
  ),
}

const SPARSE: Post = {
  href: "#sparse",
  title: "A note with no cover and no date",
  excerpt: "Both are optional, and what is missing simply is not drawn.",
  tags: ["notes"],
}

const POSTS: readonly Post[] = [
  POST,
  {
    href: "#cascade",
    title: "Cascade layers, a year in",
    excerpt: "What changed, what did not, and the one place they still surprise people.",
    tags: ["css"],
    date: "2026-02-02",
    cover: "/story-cover.svg",
  },
  {
    href: "#testing",
    title: "Testing hooks without a component",
    excerpt: "renderHook is fine. Fake timers are where it gets interesting.",
    tags: ["testing", "typescript"],
    date: "2026-01-20",
  },
]
