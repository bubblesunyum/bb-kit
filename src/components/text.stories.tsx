import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AWKWARD } from "@/test/awkward-content"
import { H1, H2, H3, H4, Label, Span, Text } from "./text"

/**
 * The paragraph, and the six wrappers that are it with the element already
 * chosen. Every story leaves palette and mode to the toolbar, so four-up shows
 * each of them against both palettes in both modes at once.
 */
const meta = {
  component: Text,
} satisfies Meta<typeof Text>

export default meta

type Story = StoryObj<typeof meta>

/**
 * The whole family. The heading levels carry a default size and nothing else,
 * so a page that needs an H3 semantically is not forced into an H3's look.
 */
export const Elements: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <H1>H1 — the page title</H1>
      <H2>H2 — a section</H2>
      <H3>H3 — a subsection</H3>
      <H4>H4 — the smallest heading</H4>
      <Text>
        Text is a paragraph, and it is the default: base size, default tone, normal weight.
      </Text>
      <Text>
        A <Span weight="semibold">Span</Span> sits inline, so it can pick up a{" "}
        <Span tone="primary">different tone</Span> mid-sentence.
      </Text>
      <div className="flex flex-col gap-1">
        <Label htmlFor="story-field" size="sm" weight="medium">
          Label renders a real label element
        </Label>
        <input
          id="story-field"
          className="border-input-border rounded-sm border px-2 py-1"
          placeholder="clicking the label focuses this"
        />
      </div>
    </div>
  ),
}

/** Level and size are independent: an H2 asked for xs is still an h2. */
export const LevelAndSizeAreSeparate: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <H2>An H2 at its default size</H2>
      <H2 size="sm">The same H2 asked for sm</H2>
      <Text size="3xl">And a paragraph asked for 3xl</Text>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {SIZES.map((size) => (
        <Text key={size} size={size}>
          {size} — the quick brown fox
        </Text>
      ))}
    </div>
  ),
}

/**
 * Tones are roles, never colours. `on-primary` and `on-danger` name the text
 * that sits on those fills, so they are shown on them — anywhere else they are
 * unreadable, which is the point.
 */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Text tone="default">default — body copy</Text>
      <Text tone="quiet">quiet — a date, a caption</Text>
      <Text tone="primary">primary — a link, an emphasis</Text>
      <Text tone="danger">danger — something went wrong</Text>
      <div className="bg-primary rounded-md p-3">
        <Text tone="on-primary">on-primary — text on the primary fill</Text>
      </div>
      <div className="bg-danger rounded-md p-3">
        <Text tone="on-danger">on-danger — text on the danger fill</Text>
      </div>
    </div>
  ),
}

export const Weights: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {WEIGHTS.map((weight) => (
        <Text key={weight} weight={weight}>
          {weight} — the quick brown fox
        </Text>
      ))}
    </div>
  ),
}

export const Alignment: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {ALIGNS.map((align) => (
        <Text key={align} align={align} className="border-border border-b">
          {align}
        </Text>
      ))}
    </div>
  ),
}

/**
 * The content that catches clipping. The unbreakable word is the one that
 * decides whether the wrapping default is doing its job: without it, that row
 * pushes the container wider than the frame.
 */
export const AwkwardContent: Story = {
  render: () => (
    <div className="border-border flex max-w-sm flex-col gap-3 border p-3">
      <H2>{AWKWARD.longTitle}</H2>
      <Text>{AWKWARD.unbreakableWord}</Text>
      <Text tone="quiet">{AWKWARD.oneCharacter}</Text>
      <Text tone="quiet">↓ an empty string, which should take no height ↓</Text>
      <Text>{AWKWARD.empty}</Text>
    </div>
  ),
}

const SIZES = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl"] as const
const WEIGHTS = ["normal", "medium", "semibold", "bold"] as const
const ALIGNS = ["start", "center", "end"] as const
