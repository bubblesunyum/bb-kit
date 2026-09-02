import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AWKWARD } from "@/test/awkward-content"

import { EmptyState } from "./empty-state"
import { HStack, VStack } from "./stack"
import { H3, Text } from "./text"

/**
 * What to show when there is nothing to show. A centred stack: an optional
 * icon, a title, a quiet description and a place for an action. It does not
 * decide where it sits or how tall its container is — callers do. Inside a
 * `List` the empty slot renders it; on its own it centres within whatever box
 * it is given.
 *
 * None of these stories pins a palette or a mode; the toolbar supplies both.
 */
const meta = {
  component: EmptyState,
} satisfies Meta<typeof EmptyState>

export default meta

type Story = StoryObj<typeof meta>

/** Every slot filled: icon, title, description and a button where the action goes. */
export const Complete: Story = {
  render: () => (
    <div className="bg-card rounded-lg border">
      <EmptyState
        icon={<InboxIcon />}
        title="No posts yet"
        description="Try adjusting the search or the selected tags."
        action={<Action>Clear filters</Action>}
      />
    </div>
  ),
}

/** Each part stands alone — title only still centres and reads as an empty state. */
export const Parts: Story = {
  render: () => (
    <VStack gap={6} className="max-w-lg">
      <div className="bg-card rounded-lg border">
        <EmptyState title="No posts yet" />
      </div>
      <div className="bg-card rounded-lg border">
        <EmptyState
          title="No posts yet"
          description="Try adjusting the search or the selected tags."
        />
      </div>
      <div className="bg-card rounded-lg border">
        <EmptyState icon={<InboxIcon />} title="No posts yet" />
      </div>
      <div className="bg-card rounded-lg border">
        <EmptyState title="No posts yet" action={<Action>Clear filters</Action>} />
      </div>
    </VStack>
  ),
}

/** With and without a card around it — the component adds no background itself. */
export const WithAndWithoutCard: Story = {
  render: () => (
    <HStack gap={4} className="max-w-2xl" align="start">
      <div className="flex-1">
        <Text tone="quiet" size="sm" className="mb-2">On the page</Text>
        <EmptyState
          icon={<InboxIcon />}
          title="No results"
          description="No posts matched that search."
        />
      </div>
      <div className="bg-card flex-1 rounded-lg border">
        <EmptyState
          icon={<InboxIcon />}
          title="No results"
          description="No posts matched that search."
        />
      </div>
    </HStack>
  ),
}

/** The content that catches clipping: long titles and unbreakable words wrap. */
export const AwkwardContent: Story = {
  render: () => (
    <div className="bg-card max-w-sm rounded-lg border">
      <EmptyState
        icon={<InboxIcon />}
        title={AWKWARD.longTitle}
        description={AWKWARD.unbreakableWord}
        action={<Action>Clear filters</Action>}
      />
    </div>
  ),
}

/**
 * Overridable from outside — tighter padding when slotted into a denser panel,
 * or a muted icon without adding a prop for it.
 */
export const Overridden: Story = {
  render: () => (
    <div className="bg-card rounded-lg border">
      <EmptyState
        className="py-6"
        icon={<InboxIcon />}
        title="No posts yet"
        description="Tighter padding, from the caller."
      />
    </div>
  ),
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h13A2.5 2.5 0 0 1 21 8.5v7A2.5 2.5 0 0 1 18.5 18h-13A2.5 2.5 0 0 1 3 15.5v-7Z" />
      <path d="m3 8 8.5 6L21 8" />
    </svg>
  )
}

function Action({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="bg-primary text-text-on-primary focus-visible:outline-focus-ring rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {children}
    </button>
  )
}
