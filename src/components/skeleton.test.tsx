import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { Skeleton } from "./skeleton"

describe("what a Skeleton paints", () => {
  test("it paints a muted bar with a pulse that holds still under reduced motion", () => {
    render(<Skeleton data-testid="skeleton" />)

    const skeleton = screen.getByTestId("skeleton")
    expect(skeleton).toHaveClass("bg-muted", "animate-pulse", "motion-reduce:animate-none")
  })

  test("it has a rounded corner without being asked", () => {
    render(<Skeleton data-testid="skeleton" />)

    expect(screen.getByTestId("skeleton")).toHaveClass("rounded-md")
  })

  test("it is full width and 16px tall by default", () => {
    render(<Skeleton data-testid="skeleton" />)

    const skeleton = screen.getByTestId("skeleton")
    expect(skeleton).toHaveClass("w-full", "h-4")
    expect(skeleton).not.toHaveAttribute("style")
  })

  test("it defaults to a single bar", () => {
    const { container } = render(<Skeleton />)

    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-slot="skeleton-line"]')).toHaveLength(0)
  })
})

describe("lines, width and height", () => {
  test("lines renders that many bars, last one shorter to read as text", () => {
    const { container } = render(<Skeleton lines={3} />)

    const lines = container.querySelectorAll('[data-slot="skeleton-line"]')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toHaveClass("w-full")
    expect(lines[1]).toHaveClass("w-full")
    expect(lines[2]).toHaveClass("w-3/4")
  })

  test("width and height set the bar size via style and remove the default classes", () => {
    render(<Skeleton width="200px" height={20} data-testid="skeleton" />)

    const skeleton = screen.getByTestId("skeleton")
    expect(skeleton).toHaveStyle({ width: "200px", height: "20px" })
    expect(skeleton).not.toHaveClass("w-full", "h-4")
  })

  test("a numeric width and height become px", () => {
    render(<Skeleton width={120} height={12} data-testid="skeleton" />)

    expect(screen.getByTestId("skeleton")).toHaveStyle({ width: "120px", height: "12px" })
  })

  test("height on a multi-line skeleton sizes each line", () => {
    const { container } = render(<Skeleton lines={2} height="12px" />)

    const lines = container.querySelectorAll('[data-slot="skeleton-line"]')
    expect(lines[0]).toHaveStyle({ height: "12px" })
    expect(lines[1]).toHaveStyle({ height: "12px" })
    expect(lines[0]).not.toHaveClass("h-4")
  })

  // width is the width of the whole skeleton, the same as it is for one bar.
  test("width on a multi-line skeleton sizes the block, and the lines fill it", () => {
    const { container } = render(<Skeleton lines={2} width="240px" data-testid="skeleton" />)

    expect(screen.getByTestId("skeleton")).toHaveStyle({ width: "240px" })
    const lines = container.querySelectorAll('[data-slot="skeleton-line"]')
    expect(lines[0]).toHaveClass("w-full")
    expect(lines[0]).not.toHaveStyle({ width: "240px" })
  })

  // Setting a width used to square the last line off, so a narrow paragraph
  // came out as identical bars and stopped reading as text.
  test("a width does not straighten the short last line", () => {
    const { container } = render(<Skeleton lines={3} width="240px" />)

    const lines = container.querySelectorAll('[data-slot="skeleton-line"]')
    expect(lines[2]).toHaveClass("w-3/4")
  })
})

describe("overriding it from outside", () => {
  test("className wins over what it sets", () => {
    render(<Skeleton className="w-1/2 h-6 rounded-none" data-testid="skeleton" />)

    const skeleton = screen.getByTestId("skeleton")
    expect(skeleton).toHaveClass("w-1/2", "h-6", "rounded-none")
    expect(skeleton).not.toHaveClass("w-full", "h-4", "rounded-md")
  })

  test("it carries a data-slot and passes the rest through", () => {
    render(<Skeleton id="ph" data-testid="skeleton" />)

    const skeleton = screen.getByTestId("skeleton")
    expect(skeleton).toHaveAttribute("data-slot", "skeleton")
    expect(skeleton).toHaveAttribute("id", "ph")
  })

  test("it is hidden from assistive tech, because the real content is not there yet", () => {
    render(<Skeleton data-testid="skeleton" />)

    expect(screen.getByTestId("skeleton")).toHaveAttribute("aria-hidden", "true")
  })
})
