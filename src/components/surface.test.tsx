import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { OutlineSurface, RaisedSurface, Surface } from "./surface"

describe("what a Surface paints", () => {
  test("it paints the card colour and its own text colour", () => {
    render(<Surface data-testid="surface">content</Surface>)

    expect(screen.getByTestId("surface")).toHaveClass("bg-card", "text-text")
  })

  test("it has a radius and padding without being asked", () => {
    render(<Surface data-testid="surface">content</Surface>)

    expect(screen.getByTestId("surface")).toHaveClass("rounded-lg", "p-4")
  })
})

describe("the three forms", () => {
  // The point of the default: a plain box, separated by its colour alone.
  test("plain has neither a border nor a shadow", () => {
    render(<Surface data-testid="surface">content</Surface>)

    const surface = screen.getByTestId("surface")
    expect(surface).not.toHaveClass("border")
    expect(surface).not.toHaveClass("shadow-xs")
  })

  test("outline draws a border in the border role", () => {
    render(<OutlineSurface data-testid="surface">content</OutlineSurface>)

    expect(screen.getByTestId("surface")).toHaveClass("border", "border-border")
  })

  test("raised lifts with a shadow and no border", () => {
    render(<RaisedSurface data-testid="surface">content</RaisedSurface>)

    const surface = screen.getByTestId("surface")
    expect(surface).toHaveClass("shadow-xs")
    expect(surface).not.toHaveClass("border")
  })

  // Defined once so nothing downstream drifts: the wrappers must be the
  // variants, not a second spelling of them.
  test("the wrappers render exactly what the variant does", () => {
    const { container: wrapped } = render(<OutlineSurface>content</OutlineSurface>)
    const { container: direct } = render(<Surface variant="outline">content</Surface>)

    expect(wrapped.innerHTML).toBe(direct.innerHTML)
  })
})

describe("overriding it from outside", () => {
  test("className wins over what it sets", () => {
    render(
      <Surface className="rounded-none p-0" data-testid="surface">
        content
      </Surface>,
    )

    const surface = screen.getByTestId("surface")
    expect(surface).toHaveClass("rounded-none", "p-0")
    expect(surface).not.toHaveClass("rounded-lg")
    expect(surface).not.toHaveClass("p-4")
  })

  test("it carries a data-slot and passes the rest through", () => {
    render(
      <Surface id="box" data-testid="surface">
        content
      </Surface>,
    )

    const surface = screen.getByTestId("surface")
    expect(surface).toHaveAttribute("data-slot", "surface")
    expect(surface).toHaveAttribute("id", "box")
  })
})

describe("a wrong guess at a variant", () => {
  // Without this the wrong value renders as a plain surface and looks right.
  test("it says so in the console rather than silently doing nothing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    // @ts-expect-error the point of the test is the value the types forbid.
    render(<Surface variant="soft">content</Surface>)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unknown Surface\'s variant "soft"'))
    warn.mockRestore()
  })
})

describe("standing in for another element", () => {
  // Card and ListItem are built on this: a card that is entirely a link has to
  // be an <a>, not a div with an <a> wrapped round it.
  test("asChild makes the child the box", () => {
    render(
      <Surface asChild variant="outline">
        <a href="/somewhere">a link that is a box</a>
      </Surface>,
    )

    const link = screen.getByRole("link", { name: "a link that is a box" })
    expect(link).toHaveClass("bg-card", "rounded-lg", "border")
    expect(link).toHaveAttribute("data-slot", "surface")
  })

  test("without it the box is a div wrapping the child", () => {
    render(
      <Surface>
        <a href="/somewhere">an ordinary link</a>
      </Surface>,
    )

    expect(screen.getByRole("link")).not.toHaveClass("bg-card")
  })
})
