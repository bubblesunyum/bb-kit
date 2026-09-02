import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { Separator } from "./separator"

describe("what a Separator paints", () => {
  test("it paints the border role and is shrink-proof inside a flex row", () => {
    render(<Separator data-testid="separator" />)

    expect(screen.getByTestId("separator")).toHaveClass("bg-border", "shrink-0")
  })

  test("it carries the separator role with an orientation", () => {
    render(<Separator data-testid="separator" />)

    const separator = screen.getByTestId("separator")
    expect(separator).toHaveAttribute("role", "separator")
    expect(separator).toHaveAttribute("aria-orientation", "horizontal")
    expect(separator).toHaveAttribute("data-orientation", "horizontal")
  })
})

describe("orientation", () => {
  test("horizontal is the default — a hairline across", () => {
    render(<Separator data-testid="separator" />)

    expect(screen.getByTestId("separator")).toHaveClass("h-px", "w-full")
  })

  test("vertical is a hairline tall", () => {
    render(<Separator orientation="vertical" data-testid="separator" />)

    const separator = screen.getByTestId("separator")
    expect(separator).toHaveClass("w-px", "h-full")
    expect(separator).not.toHaveClass("h-px", "w-full")
  })

  test("a wrong guess at an orientation says so in the console", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    // @ts-expect-error the point of the test is the value the types forbid.
    render(<Separator orientation="diagonal" />)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unknown Separator\'s orientation "diagonal"'))
    warn.mockRestore()
  })
})

describe("overriding it from outside", () => {
  test("className wins over what it sets", () => {
    render(<Separator className="bg-muted" data-testid="separator" />)

    const separator = screen.getByTestId("separator")
    expect(separator).toHaveClass("bg-muted")
    expect(separator).not.toHaveClass("bg-border")
  })

  test("it carries a data-slot and passes the rest through", () => {
    render(<Separator id="line" data-testid="separator" />)

    const separator = screen.getByTestId("separator")
    expect(separator).toHaveAttribute("data-slot", "separator")
    expect(separator).toHaveAttribute("id", "line")
  })
})
