import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { HStack, VStack } from "./stack"

describe("direction and its defaults", () => {
  test("VStack stacks downward and HStack sideways", () => {
    render(
      <>
        <VStack data-testid="down">child</VStack>
        <HStack data-testid="across">child</HStack>
      </>,
    )

    expect(screen.getByTestId("down")).toHaveClass("flex", "flex-col")
    expect(screen.getByTestId("across")).toHaveClass("flex", "flex-row")
  })

  // The gap nobody has to ask for — Rule 1.
  test("both start at an 8px gap, aligned to the start of their own direction", () => {
    render(
      <>
        <VStack data-testid="down">child</VStack>
        <HStack data-testid="across">child</HStack>
      </>,
    )

    expect(screen.getByTestId("down")).toHaveClass("gap-2", "items-stretch", "justify-start")
    expect(screen.getByTestId("across")).toHaveClass("gap-2", "items-center", "justify-start")
  })
})

describe("gap, align and justify", () => {
  test("gap takes Tailwind's scale rather than a second one of ours", () => {
    render(
      <VStack gap={8} data-testid="stack">
        child
      </VStack>,
    )

    expect(screen.getByTestId("stack")).toHaveClass("gap-8")
    expect(screen.getByTestId("stack")).not.toHaveClass("gap-2")
  })

  test("align and justify each set one class", () => {
    render(
      <HStack align="baseline" justify="between" data-testid="stack">
        child
      </HStack>,
    )

    expect(screen.getByTestId("stack")).toHaveClass("items-baseline", "justify-between")
  })
})

describe("what the caller can override", () => {
  // Rule 6: merged rather than concatenated, so the caller's class wins by
  // being the only one left rather than by CSS specificity.
  test("className replaces the class it conflicts with", () => {
    render(
      <VStack gap={2} className="gap-8" data-testid="stack">
        child
      </VStack>,
    )

    expect(screen.getByTestId("stack")).toHaveClass("gap-8")
    expect(screen.getByTestId("stack")).not.toHaveClass("gap-2")
  })

  test("every part carries a data-slot, and native attributes pass through", () => {
    render(<VStack id="rows" data-testid="stack" />)

    const stack = screen.getByTestId("stack")
    expect(stack).toHaveAttribute("data-slot", "stack")
    expect(stack).toHaveAttribute("id", "rows")
  })
})

// The old kit's Stack swapped its children for one bar while loading; this is
// the test that keeps that from coming back.
test("children are rendered as given, in order, and never replaced", () => {
  render(
    <VStack>
      <span>one</span>
      <span>two</span>
    </VStack>,
  )

  expect(screen.getByText("one")).toBeInTheDocument()
  expect(screen.getByText("two")).toBeInTheDocument()
})

describe("standing in for another element", () => {
  // This is how List gets its <ul> without a second gap scale to keep in step.
  test("asChild makes the child the stack", () => {
    render(
      <VStack asChild gap={6}>
        <ul data-testid="rows">
          <li>a row</li>
        </ul>
      </VStack>,
    )

    const rows = screen.getByTestId("rows")
    expect(rows.tagName).toBe("UL")
    expect(rows).toHaveClass("flex", "flex-col", "gap-6")
  })
})
