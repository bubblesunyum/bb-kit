import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AWKWARD } from "@/test/awkward-content"
import { Page } from "./page"
import { VStack } from "./stack"
import { H1, Text } from "./text"

/**
 * The background everything else sits on. Storybook's own decorator already
 * paints one, so a bare `Page` here would be invisible against it — every story
 * below sits in a muted frame so the page colour has an edge to be seen at.
 * None of them pins a palette or a mode; the toolbar supplies both.
 */
const meta = {
  component: Page,
} satisfies Meta<typeof Page>

export default meta

type Story = StoryObj<typeof meta>

/** Background, text colour, full viewport height. Nothing else. */
export const Defaults: Story = {
  render: () => (
    <Frame>
      <Page className="min-h-48 p-6">
        <VStack gap={2}>
          <H1>bb-kit</H1>
          <Text tone="quiet">Quiet text, legible because the page under it is painted.</Text>
        </VStack>
      </Page>
    </Frame>
  ),
}

/**
 * The same content with no `Page`: it takes whatever surface is behind it,
 * which here is the muted frame rather than the page. On a real site there is
 * no frame and no `Theme` above it either, so what shows through is the
 * browser's own white — under dark-mode text, unreadable.
 */
export const Unpainted: Story = {
  render: () => (
    <Frame>
      <div className="min-h-48 p-6">
        <VStack gap={2}>
          <H1>bb-kit</H1>
          <Text tone="quiet">Quiet text, on whatever surface happens to be behind it.</Text>
        </VStack>
      </div>
    </Frame>
  ),
}

/**
 * A page shorter than the viewport still paints all the way down — the reason
 * the height is dvh and not a percentage of a parent that has no height. It is
 * why this story is a viewport tall in four-up: that is the behaviour.
 */
export const ShortContent: Story = {
  render: () => (
    <Frame>
      <Page className="p-6">
        <Text>One line, and the paint reaches the bottom of the viewport.</Text>
      </Page>
    </Frame>
  ),
}

/** The content that catches clipping: an unbreakable word has nothing to push against. */
export const AwkwardContent: Story = {
  render: () => (
    <Frame>
      <Page className="min-h-48 max-w-sm p-6">
        <VStack gap={2}>
          <H1>{AWKWARD.longTitle}</H1>
          <Text tone="quiet">{AWKWARD.unbreakableWord}</Text>
        </VStack>
      </Page>
    </Frame>
  ),
}

/** Something that is not the page colour, so the page colour has an edge. */
function Frame({ children }: { children: React.ReactNode }) {
  return <div className="bg-muted border-border border p-4">{children}</div>
}
