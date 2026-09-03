"use client"

import { useState } from "react"

import { Badge } from "@/components/badge"
import { GhostButton } from "@/components/button"
import { EmptyState } from "@/components/empty-state"
import { FilterBar } from "@/components/filter-bar"
import { List } from "@/components/list"
import { Page } from "@/components/page"
import { Separator } from "@/components/separator"
import { HStack, VStack } from "@/components/stack"
import { H1, H2, Text } from "@/components/text"
import { PostCard, PostRow, type Post } from "@/examples/post"
import { useFilteredItems } from "@/hooks/use-filtered-items"
import { collectTagsWithSelection } from "@/lib/filtering"

/**
 * The first real user of the kit: a filter bar, a set of posts and an empty
 * state, at a real page width, built out of nothing but the pieces.
 *
 * Storybook shows a component against itself. This is where the pieces get
 * tested against each other — where the tag row has to sit under a heading, the
 * cards have to line up in a grid, and the empty state has to appear in the
 * hole the list leaves.
 *
 * It is one file rather than an application on purpose. Nothing here is
 * installable; it is the page to look at when something feels wrong.
 */
export default function KitchenSinkPage() {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [layout, setLayout] = useState<Layout>("cards")

  const criteria = { text: query, tags: selected }
  const posts = useFilteredItems(POSTS, criteria, ACCESSORS)
  const tags = collectTagsWithSelection(POSTS, criteria, ACCESSORS)

  const filtering = query !== "" || selected.length > 0
  const clear = () => {
    setQuery("")
    setSelected([])
  }

  return (
    <Page>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <VStack gap={2}>
          <H1>Writing</H1>
          <Text tone="quiet">
            Notes on design systems, CSS and the parts of TypeScript that keep coming up.
          </Text>
        </VStack>

        <FilterBar
          tags={tags}
          selected={selected}
          onSelectedChange={setSelected}
          query={query}
          onQueryChange={setQuery}
        />

        <Separator />

        <HStack justify="between" className="flex-wrap gap-3">
          {/* A real H2, and not only for tidiness: the post titles inside the
              cards are H3s, and a page that goes from H1 straight to H3 fails
              the heading-order check a screen reader relies on to skim. */}
          <HStack gap={3}>
            <H2 size="lg">Posts</H2>
            <Text size="sm" tone="quiet">
              {posts.length} of {POSTS.length} posts
            </Text>
          </HStack>
          <LayoutChoice layout={layout} onLayoutChange={setLayout} />
        </HStack>

        {posts.length === 0 ? (
          <Nothing filtering={filtering} onClear={clear} />
        ) : layout === "cards" ? (
          /* A grid rather than a List: a card is a box that stands on its own,
             and wrapping one in a list row would paint a second surface under
             it and pad it twice. Rows are the shape a List is for. */
          <div className="grid gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.href} post={post} />
            ))}
          </div>
        ) : (
          <List
            items={posts}
            gap={3}
            getKey={(post) => post.href}
            renderItem={(post) => <PostRow post={post} />}
          />
        )}
      </main>
    </Page>
  )
}

/**
 * Cards or rows. Two `Badge` toggles rather than a control of their own —
 * selected and unselected is exactly what a badge already says, and a page is
 * free to compose one where a kit component would need a new part.
 */
function LayoutChoice({ layout, onLayoutChange }: LayoutChoiceProps) {
  return (
    <HStack gap={2} asChild>
      <div role="group" aria-label="Layout">
        {LAYOUTS.map(({ value, label }) => (
          <Badge
            key={value}
            size="sm"
            selected={layout === value}
            onSelectedChange={() => onLayoutChange(value)}
          >
            {label}
          </Badge>
        ))}
      </div>
    </HStack>
  )
}

/**
 * Nothing matched. The way out is offered rather than described — a reader who
 * has filtered themselves into a corner wants the button, not the explanation.
 */
function Nothing({ filtering, onClear }: { filtering: boolean; onClear: () => void }) {
  return (
    <EmptyState
      title={filtering ? "Nothing matches that" : "Nothing here yet"}
      description={
        filtering
          ? "Try a shorter search, or drop one of the tags."
          : "Posts will appear here once there are some."
      }
      action={filtering ? <GhostButton onClick={onClear}>Clear filters</GhostButton> : undefined}
    />
  )
}

type LayoutChoiceProps = {
  layout: Layout
  onLayoutChange: (next: Layout) => void
}

type Layout = (typeof LAYOUTS)[number]["value"]

const LAYOUTS = [
  { value: "cards", label: "Cards" },
  { value: "rows", label: "Rows" },
] as const

// Hoisted, as the hook asks: written inline they would be new functions every
// render and the memo would have nothing to hold on to.
const ACCESSORS = {
  getTags: (post: Post) => post.tags,
  getText: (post: Post) => `${post.title} ${post.excerpt}`,
}

const POSTS: readonly Post[] = [
  {
    href: "#tokens",
    title: "Designing tokens that survive a redesign",
    excerpt:
      "Roles, not colours. A token named for where it is used outlives the palette it was drawn from; a token named for its hue does not.",
    tags: ["design", "css"],
    date: "2026-03-14",
    cover: "/story-cover.svg",
  },
  {
    href: "#cascade",
    title: "Cascade layers, a year in",
    excerpt: "What changed, what did not, and the one place they still surprise people.",
    tags: ["css"],
    date: "2026-02-02",
    cover: "/story-cover.svg",
  },
  {
    href: "#light-dark",
    title: "light-dark() and the end of the dark: prefix",
    excerpt:
      "One attribute for the palette, the browser's own colour-scheme for the mode, and a light island inside a dark page that finally comes out right.",
    tags: ["css", "design"],
    date: "2026-01-28",
    cover: "/story-cover.svg",
  },
  {
    href: "#hooks",
    title: "Testing hooks without a component",
    excerpt: "renderHook is fine. Fake timers are where it gets interesting.",
    tags: ["testing", "typescript"],
    date: "2026-01-20",
  },
  {
    href: "#narrowing",
    title: "Narrowing is a design tool",
    excerpt:
      "A union you cannot construct wrongly is worth more than a runtime check that says so politely.",
    tags: ["typescript"],
    date: "2025-12-11",
  },
  {
    href: "#accessible-names",
    title: "The accessible name is not the label",
    excerpt: "Six ways a control gets its name, in the order the browser tries them.",
    tags: ["accessibility"],
    date: "2025-11-30",
    cover: "/story-cover.svg",
  },
  {
    href: "#motion",
    title: "Motion that earns its keep",
    excerpt:
      "Most movement should be keeping the reader oriented. The rest should be worth watching twice.",
    tags: ["design", "accessibility"],
    date: "2025-11-02",
  },
  {
    href: "#notes",
    title: "A note with no cover and no date",
    excerpt: "Both are optional in the shape, and what is missing simply is not drawn.",
    tags: ["notes"],
  },
]
