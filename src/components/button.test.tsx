import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { AWKWARD } from "@/test/awkward-content"
import { Button, DangerButton, GhostButton, LinkButton, PrimaryButton } from "./button"

describe("what a Button is", () => {
  test("it is a real button element", () => {
    render(<Button>Press</Button>)

    expect(screen.getByRole("button", { name: "Press" })).toBeInTheDocument()
  })

  test("it is primary at medium without being asked", () => {
    render(<Button>Press</Button>)

    expect(screen.getByRole("button")).toHaveClass("bg-primary", "min-h-10")
  })

  test("it carries a data-slot and passes the rest through", () => {
    render(
      <Button id="go" type="submit">
        Press
      </Button>,
    )

    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("data-slot", "button")
    expect(button).toHaveAttribute("id", "go")
    expect(button).toHaveAttribute("type", "submit")
  })
})

describe("the four forms", () => {
  test("primary and danger fill, ghost and link do not", () => {
    render(
      <>
        <PrimaryButton>primary</PrimaryButton>
        <GhostButton>ghost</GhostButton>
        <LinkButton>link</LinkButton>
        <DangerButton>danger</DangerButton>
      </>,
    )

    expect(screen.getByRole("button", { name: "primary" })).toHaveClass("bg-primary")
    expect(screen.getByRole("button", { name: "danger" })).toHaveClass("bg-danger")
    expect(screen.getByRole("button", { name: "ghost" })).not.toHaveClass("bg-primary")
    expect(screen.getByRole("button", { name: "link" })).not.toHaveClass("bg-primary")
  })

  test("the wrappers render exactly what the variant does", () => {
    const { container: wrapped } = render(<GhostButton>x</GhostButton>)
    const { container: direct } = render(<Button variant="ghost">x</Button>)

    expect(wrapped.innerHTML).toBe(direct.innerHTML)
  })

  // The word an agent types from shadcn habit. Warning about it would be
  // warning about a right answer.
  test('variant="default" is primary, silently', () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    const { container: aliased } = render(<Button variant="default">x</Button>)
    const { container: direct } = render(<Button variant="primary">x</Button>)

    expect(aliased.innerHTML).toBe(direct.innerHTML)
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe("the three sizes", () => {
  test("they are 32, 40 and 48px tall", () => {
    render(
      <>
        <Button size="sm">sm</Button>
        <Button size="md">md</Button>
        <Button size="lg">lg</Button>
      </>,
    )

    expect(screen.getByRole("button", { name: "sm" })).toHaveClass("min-h-8")
    expect(screen.getByRole("button", { name: "md" })).toHaveClass("min-h-10")
    expect(screen.getByRole("button", { name: "lg" })).toHaveClass("min-h-12")
  })

  // A fixed height turns a long label into text sitting outside its own button.
  test("the height is a minimum, so a long label grows the button", () => {
    render(<Button>{AWKWARD.longTitle}</Button>)

    const button = screen.getByRole("button")
    expect(button).toHaveClass("min-h-10")
    expect(button).not.toHaveClass("h-10")
  })
})

describe("focus and disabled", () => {
  // :focus would put a ring on every mouse click.
  test("the ring is on focus-visible and never on focus", () => {
    render(<Button>Press</Button>)

    const className = screen.getByRole("button").className
    expect(className).toContain("focus-visible:outline-2")
    expect(className).toContain("focus-visible:outline-focus-ring")
    expect(className).not.toMatch(/(^|\s)focus:/)
  })

  test("a disabled button cannot be pressed and stops reacting to the pointer", () => {
    render(<Button disabled>Press</Button>)

    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
    expect(button).toHaveClass("disabled:pointer-events-none", "disabled:text-disabled-text")
  })
})

describe("overriding it from outside", () => {
  test("className wins over what it sets", () => {
    render(<Button className="min-h-0 rounded-none">Press</Button>)

    const button = screen.getByRole("button")
    expect(button).toHaveClass("min-h-0", "rounded-none")
    expect(button).not.toHaveClass("min-h-10")
    expect(button).not.toHaveClass("rounded-lg")
  })
})

describe("a wrong guess at a variant or size", () => {
  test("it says so in the console rather than silently doing nothing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    // @ts-expect-error the point of the test is the value the types forbid.
    render(<Button variant="secondary">x</Button>)
    // @ts-expect-error same again for the size.
    render(<Button size="xl">x</Button>)

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("unknown Button's variant \"secondary\""),
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("unknown Button's size \"xl\""))
    warn.mockRestore()
  })
})
