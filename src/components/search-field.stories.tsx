import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AWKWARD } from "@/test/awkward-content"
import { SearchField } from "./search-field"
import { HStack, VStack } from "./stack"
import { H4, Text } from "./text"

/**
 * A real search input, with the magnifier and the clear button a reader expects
 * on one. It never holds its own text — every story below keeps the value in
 * the story, which is what `FilterBar` will do too.
 *
 * No story pins a palette or a mode; the toolbar supplies both.
 */
const meta = {
  component: SearchField,
  /* `value` is required on the component, so without a default here every
     story below would have to declare args it does not use — each one renders
     its own stateful Field instead. */
  args: { value: "" },
} satisfies Meta<typeof SearchField>

export default meta

type Story = StoryObj<typeof meta>

/** The default: empty, medium, placeholder saying Search. */
export const Defaults: Story = {
  render: () => <Field className="w-80" />,
}

/**
 * Empty and filled side by side. The clear button appears only when there is
 * something to clear, which is a state rather than a prop — there is no way to
 * switch it off.
 */
export const EmptyAndFilled: Story = {
  render: () => (
    <VStack align="start" gap={4}>
      <Field className="w-80" />
      <Field className="w-80" initial="design systems" />
    </VStack>
  ),
}

/** 32, 40 and 48px — the same heights as Button and Badge, so a filter bar lines up. */
export const Sizes: Story = {
  render: () => (
    <VStack gap={4}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <HStack key={size} align="center" gap={3}>
          <Text tone="quiet" size="sm" className="w-8">
            {size}
          </Text>
          <Field size={size} className="w-80" initial="design" />
        </HStack>
      ))}
    </VStack>
  ),
}

/**
 * Rest, hover, focus and disabled. The forced state is `focus-visible`, never
 * `focus`: asking for `focus` shows nothing, and the natural wrong fix puts a
 * ring on every mouse click.
 */
export const States: Story = {
  render: () => (
    <VStack gap={5}>
      {STATES.map(({ label, className, disabled }) => (
        <VStack key={label} gap={2}>
          <H4 size="sm">{label}</H4>
          <div className={className}>
            <Field className="w-80" initial="design" disabled={disabled} />
          </div>
        </VStack>
      ))}
    </VStack>
  ),
  parameters: {
    pseudo: {
      hover: [".state-hover input"],
      focusVisible: [".state-focus input"],
    },
  },
}

/**
 * The ring sits outside the field, so the gap shows whatever is behind it. A
 * filter bar appears on the page and inside a card, and both have to keep it.
 */
export const FocusOnEitherBackground: Story = {
  /* Stacked rather than side by side: four-up gives each palette a column
     narrower than two of these in a row, and the light cell then bleeds over
     the dark one and hides the very thing this story exists to show. */
  render: () => (
    <VStack align="start" gap={4}>
      <div className="bg-page rounded-lg p-4">
        <Field className="w-56" />
      </div>
      <div className="bg-card rounded-lg p-4">
        <Field className="w-56" initial="design" />
      </div>
    </VStack>
  ),
  parameters: { pseudo: { focusVisible: ["input"] } },
}

/**
 * A reader pastes whatever is on their clipboard. The field is one line by
 * definition, so a long value scrolls inside it rather than growing the box and
 * pushing the rest of the bar off the page.
 */
export const AwkwardContent: Story = {
  render: () => (
    <VStack align="start" gap={4}>
      <Field className="w-80" initial={AWKWARD.unbreakableWord} />
      <Field className="w-80" placeholder={AWKWARD.longTitle} />
      <Field className="w-40" initial="a narrow field" />
    </VStack>
  ),
}

/** Every part bends from outside — Rule 6, and each part has a data-slot. */
export const Overridden: Story = {
  render: () => (
    <VStack align="start" gap={4}>
      <Field className="w-80 [&_input]:rounded-none" initial="square ends" />
      <Field className="w-80 [&_[data-slot=search-field-icon]]:hidden" initial="no magnifier" />
    </VStack>
  ),
}

/** The caller owns the text; the field only asks for the new one. */
function Field({ initial = "", ...props }: FieldProps) {
  const [value, setValue] = useState(initial)

  return <SearchField value={value} onValueChange={setValue} {...props} />
}

type FieldProps = Omit<Parameters<typeof SearchField>[0], "value" | "onValueChange"> & {
  initial?: string
}

// The addon matches by selector, so each row carries the class its rule names.
const STATES: readonly { label: string; className: string; disabled?: boolean }[] = [
  { label: "rest", className: "state-rest" },
  { label: "hover", className: "state-hover" },
  { label: "focus-visible", className: "state-focus" },
  { label: "disabled", className: "state-disabled", disabled: true },
]
