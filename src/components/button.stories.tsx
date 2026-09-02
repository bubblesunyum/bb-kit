import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AWKWARD } from "@/test/awkward-content"
import { Button, DangerButton, GhostButton, LinkButton, PrimaryButton } from "./button"
import { HStack, VStack } from "./stack"
import { H4, Text } from "./text"

/**
 * A real `<button>` in four paints and three sizes. The shape, the sizes and
 * the focus ring are shared, so a row of mixed buttons lines up on its own.
 *
 * None of these stories pins a palette or a mode; the toolbar supplies both.
 * Switch to the clashing palette with the Forms story open — every form has to
 * stay readable and stay distinguishable from the others.
 */
const meta = {
  component: Button,
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

/** All four forms side by side. This is the story that catches drift. */
export const Forms: Story = {
  render: () => (
    <HStack align="center" gap={3}>
      <PrimaryButton>Publish</PrimaryButton>
      <GhostButton>Save draft</GhostButton>
      <LinkButton>Preview</LinkButton>
      <DangerButton>Delete</DangerButton>
    </HStack>
  ),
}

/** The default: primary, medium, and nothing asked for. */
export const Defaults: Story = {
  render: () => <Button>Publish</Button>,
}

/** 32, 40 and 48px. Every form takes every size, so this is one form's worth. */
export const Sizes: Story = {
  render: () => (
    <VStack gap={4}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <HStack key={size} align="center" gap={3}>
          <Text tone="quiet" size="sm" className="w-8">
            {size}
          </Text>
          <PrimaryButton size={size}>Publish</PrimaryButton>
          <GhostButton size={size}>Save draft</GhostButton>
          <LinkButton size={size}>Preview</LinkButton>
          <DangerButton size={size}>Delete</DangerButton>
        </HStack>
      ))}
    </VStack>
  ),
}

/**
 * Rest, hover, press, focus and disabled, all at once. Only one element on a
 * page can hold focus, so the states are forced rather than performed — and
 * the forced state is `focus-visible`, never `focus`: asking for `focus` shows
 * nothing here, and the natural wrong fix is to restyle the button to `:focus`,
 * which puts a ring on every mouse click.
 */
export const States: Story = {
  render: () => (
    <VStack gap={5}>
      {STATES.map(({ label, className, disabled }) => (
        <VStack key={label} gap={2}>
          <H4 size="sm">{label}</H4>
          <HStack align="center" gap={3} className={className}>
            <PrimaryButton disabled={disabled}>Publish</PrimaryButton>
            <GhostButton disabled={disabled}>Save draft</GhostButton>
            <LinkButton disabled={disabled}>Preview</LinkButton>
            <DangerButton disabled={disabled}>Delete</DangerButton>
          </HStack>
        </VStack>
      ))}
    </VStack>
  ),
  parameters: {
    pseudo: {
      hover: [".state-hover button"],
      active: [".state-active button"],
      focusVisible: [".state-focus button"],
    },
  },
}

/**
 * The focus ring sits outside the button, so its gap shows whatever is actually
 * behind it. On the page and on a card are different backgrounds, and both have
 * to keep the ring visible.
 */
export const FocusOnEitherBackground: Story = {
  render: () => (
    <HStack align="center" gap={4}>
      <div className="bg-page rounded-lg p-4">
        <PrimaryButton>On the page</PrimaryButton>
      </div>
      <div className="bg-card rounded-lg p-4">
        <PrimaryButton>On a card</PrimaryButton>
      </div>
    </HStack>
  ),
  parameters: { pseudo: { focusVisible: ["button"] } },
}

/**
 * The height is a minimum rather than a fixed height: a label longer than the
 * space it was given grows the button instead of spilling out of it. The one
 * unbreakable word is the case that has nothing to wrap at.
 */
export const AwkwardContent: Story = {
  render: () => (
    <VStack align="start" gap={4}>
      <PrimaryButton className="max-w-sm">{AWKWARD.longTitle}</PrimaryButton>
      <GhostButton className="max-w-sm">{AWKWARD.unbreakableWord}</GhostButton>
      <DangerButton>{AWKWARD.oneCharacter}</DangerButton>
    </VStack>
  ),
}

/** Every part bends from outside — Rule 6. */
export const Overridden: Story = {
  render: () => (
    <HStack align="center" gap={3}>
      <PrimaryButton className="rounded-none">Square</PrimaryButton>
      <PrimaryButton className="w-full max-w-xs">Full width</PrimaryButton>
    </HStack>
  ),
}

// The addon matches by selector, so each row carries the class its rule names.
const STATES: readonly { label: string; className: string; disabled?: boolean }[] = [
  { label: "rest", className: "state-rest" },
  { label: "hover", className: "state-hover" },
  { label: "press", className: "state-active" },
  { label: "focus-visible", className: "state-focus" },
  { label: "disabled", className: "state-disabled", disabled: true },
]
