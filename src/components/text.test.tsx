import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "jest-axe"
import { describe, expect, test } from "vitest"

import { AWKWARD } from "@/test/awkward-content"
import { H1, H2, H3, H4, Label, Span, Text } from "./text"

describe("the element each wrapper renders", () => {
  test("Text is a paragraph and the headings carry their level", () => {
    render(
      <>
        <H1>one</H1>
        <H2>two</H2>
        <H3>three</H3>
        <H4>four</H4>
        <Text>body</Text>
      </>,
    )

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("one")
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("two")
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("three")
    expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent("four")
    expect(screen.getByText("body").tagName).toBe("P")
  })

  test("Span is inline, so it can sit inside a sentence", () => {
    render(<Span>inline</Span>)

    expect(screen.getByText("inline").tagName).toBe("SPAN")
  })

  // The reason Label exists at all: styled text would not do this.
  test("Label is a real label, and clicking it focuses the control it names", async () => {
    render(
      <>
        <Label htmlFor="field">Name</Label>
        <input id="field" />
      </>,
    )

    await userEvent.click(screen.getByText("Name"))

    expect(screen.getByLabelText("Name")).toHaveFocus()
  })
})

describe("size, tone, weight and align", () => {
  test("a heading defaults size and weight, and both still override", () => {
    render(
      <>
        <H2>default</H2>
        <H2 size="sm" weight="normal">
          overridden
        </H2>
      </>,
    )

    expect(screen.getByText("default")).toHaveClass("text-2xl", "font-semibold")
    expect(screen.getByText("overridden")).toHaveClass("text-sm", "font-normal")
    expect(screen.getByText("overridden")).not.toHaveClass("text-2xl", "font-semibold")
  })

  test("the defaults are base, default tone, normal weight, start", () => {
    render(<Text>plain</Text>)

    expect(screen.getByText("plain")).toHaveClass(
      "text-base",
      "text-text",
      "font-normal",
      "text-start",
    )
  })

  test("tone names a role, so nothing in the class list is a colour", () => {
    render(
      <Text tone="on-primary" weight="bold" align="center">
        toned
      </Text>,
    )

    expect(screen.getByText("toned")).toHaveClass(
      "text-text-on-primary",
      "font-bold",
      "text-center",
    )
  })
})

describe("what the caller can override", () => {
  // Rule 6: merged rather than concatenated, so the caller's class wins by
  // being the only one left rather than by CSS specificity.
  test("className replaces the class it conflicts with", () => {
    render(
      <Text size="sm" className="text-3xl">
        merged
      </Text>,
    )

    expect(screen.getByText("merged")).toHaveClass("text-3xl")
    expect(screen.getByText("merged")).not.toHaveClass("text-sm")
  })

  test("every part carries a data-slot, and native attributes pass through", () => {
    render(<Text id="para" data-testid="passthrough" />)

    const paragraph = screen.getByTestId("passthrough")
    expect(paragraph).toHaveAttribute("data-slot", "text")
    expect(paragraph).toHaveAttribute("id", "para")
  })
})

test("a long unbreakable word is allowed to break rather than overflow", () => {
  render(<Text>{AWKWARD.unbreakableWord}</Text>)

  expect(screen.getByText(AWKWARD.unbreakableWord)).toHaveClass("wrap-break-word")
})

test("the whole family passes the accessibility checker", async () => {
  const { container } = render(
    <main>
      <H1>{AWKWARD.longTitle}</H1>
      <H2>A section</H2>
      <Text>
        Body copy with a <Span tone="primary">span</Span> in it.
      </Text>
      <Label htmlFor="checked-field">Name</Label>
      <input id="checked-field" />
    </main>,
  )

  expect(await axe(container)).toHaveNoViolations()
})
