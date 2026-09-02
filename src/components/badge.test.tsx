import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"

import { AWKWARD } from "@/test/awkward-content"
import { Badge } from "./badge"

describe("what a Badge is", () => {
  test("it is a real button that reports its pressed state", () => {
    render(<Badge>Design</Badge>)

    const badge = screen.getByRole("button", { name: "Design" })
    expect(badge).toHaveAttribute("type", "button")
    expect(badge).toHaveAttribute("aria-pressed", "false")
  })

  test("it is unselected at medium without being asked", () => {
    render(<Badge>Design</Badge>)

    expect(screen.getByRole("button")).toHaveClass("min-h-10", "border-input-border")
  })

  test("it carries a data-slot and passes the rest through", () => {
    render(
      <Badge id="tag-design" title="Design">
        Design
      </Badge>,
    )

    const badge = screen.getByRole("button")
    expect(badge).toHaveAttribute("data-slot", "badge")
    expect(badge).toHaveAttribute("id", "tag-design")
  })
})

describe("selected and unselected are states, not variants", () => {
  test("selected fills with primary, unselected only outlines", () => {
    render(
      <>
        <Badge selected>on</Badge>
        <Badge>off</Badge>
      </>,
    )

    expect(screen.getByRole("button", { name: "on" })).toHaveClass("bg-primary")
    expect(screen.getByRole("button", { name: "off" })).not.toHaveClass("bg-primary")
  })

  // Someone who cannot tell the hues apart still has to see which is which.
  test("they differ by weight and text colour as well as by fill", () => {
    render(
      <>
        <Badge selected>on</Badge>
        <Badge>off</Badge>
      </>,
    )

    expect(screen.getByRole("button", { name: "on" })).toHaveClass(
      "font-medium",
      "text-text-on-primary",
    )
    expect(screen.getByRole("button", { name: "off" })).toHaveClass("font-normal", "text-text")
  })

  test("aria-pressed follows selected", () => {
    render(<Badge selected>Design</Badge>)

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true")
  })
})

describe("toggling it", () => {
  test("a click asks for the opposite of what it is", async () => {
    const onSelectedChange = vi.fn()
    render(<Badge onSelectedChange={onSelectedChange}>Design</Badge>)

    await userEvent.click(screen.getByRole("button"))

    expect(onSelectedChange).toHaveBeenCalledWith(true)
  })

  test("a selected one asks to be turned off", async () => {
    const onSelectedChange = vi.fn()
    render(
      <Badge selected onSelectedChange={onSelectedChange}>
        Design
      </Badge>,
    )

    await userEvent.click(screen.getByRole("button"))

    expect(onSelectedChange).toHaveBeenCalledWith(false)
  })

  test("a caller's own onClick still runs", async () => {
    const onClick = vi.fn()
    const onSelectedChange = vi.fn()
    render(
      <Badge onClick={onClick} onSelectedChange={onSelectedChange}>
        Design
      </Badge>,
    )

    await userEvent.click(screen.getByRole("button"))

    expect(onClick).toHaveBeenCalled()
    expect(onSelectedChange).toHaveBeenCalled()
  })

  test("preventing the default stops the toggle", async () => {
    const onSelectedChange = vi.fn()
    render(
      <Badge onClick={(event) => event.preventDefault()} onSelectedChange={onSelectedChange}>
        Design
      </Badge>,
    )

    await userEvent.click(screen.getByRole("button"))

    expect(onSelectedChange).not.toHaveBeenCalled()
  })

  test("a disabled badge does not toggle", async () => {
    const onSelectedChange = vi.fn()
    render(
      <Badge disabled onSelectedChange={onSelectedChange}>
        Design
      </Badge>,
    )

    await userEvent.click(screen.getByRole("button"))

    expect(screen.getByRole("button")).toBeDisabled()
    expect(onSelectedChange).not.toHaveBeenCalled()
  })

  // A badge is often only a label, and no handler should not mean a crash.
  test("a click with no handler does nothing", async () => {
    render(<Badge>Design</Badge>)

    await userEvent.click(screen.getByRole("button"))

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false")
  })
})

describe("the three sizes", () => {
  test("they are 32, 40 and 48px tall, and the height is a minimum", () => {
    render(
      <>
        <Badge size="sm">sm</Badge>
        <Badge size="md">md</Badge>
        <Badge size="lg">lg</Badge>
      </>,
    )

    expect(screen.getByRole("button", { name: "sm" })).toHaveClass("min-h-8")
    expect(screen.getByRole("button", { name: "md" })).toHaveClass("min-h-10")
    expect(screen.getByRole("button", { name: "lg" })).toHaveClass("min-h-12")
  })

  test("a long tag grows the badge instead of spilling out of it", () => {
    render(<Badge>{AWKWARD.longTitle}</Badge>)

    const badge = screen.getByRole("button")
    expect(badge).toHaveClass("min-h-10", "wrap-anywhere")
    expect(badge).not.toHaveClass("h-10")
  })

  // rounded-full is half the *actual* height, so a wrapped tag grows ellipse
  // ends that its own middle lines run into.
  test("the radius is half the minimum height, not half the real one", () => {
    render(<Badge>Design</Badge>)

    const badge = screen.getByRole("button")
    expect(badge).toHaveClass("rounded-[1.25rem]")
    expect(badge).not.toHaveClass("rounded-full")
  })
})

describe("focus and overriding", () => {
  // :focus would put a ring on every mouse click.
  test("the ring is on focus-visible and never on focus", () => {
    render(<Badge>Design</Badge>)

    const className = screen.getByRole("button").className
    expect(className).toContain("focus-visible:outline-focus-ring")
    expect(className).not.toMatch(/(^|\s)focus:/)
  })

  test("className wins over what it sets", () => {
    render(<Badge className="min-h-0 rounded-none">Design</Badge>)

    const badge = screen.getByRole("button")
    expect(badge).toHaveClass("min-h-0", "rounded-none")
    expect(badge).not.toHaveClass("min-h-10")
    expect(badge).not.toHaveClass("rounded-[1.25rem]")
  })
})

describe("a wrong guess at a size", () => {
  test("it says so in the console rather than silently doing nothing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    // @ts-expect-error the point of the test is the value the types forbid.
    render(<Badge size="xl">x</Badge>)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unknown Badge\'s size "xl"'))
    warn.mockRestore()
  })
})
