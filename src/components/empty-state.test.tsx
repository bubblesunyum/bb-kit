import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { describe, expect, test } from "vitest"

import { EmptyState } from "./empty-state"

describe("what an EmptyState renders", () => {
  test("it renders a title, description, icon and action where given", () => {
    render(
      <EmptyState
        title="No posts yet"
        description="Try adjusting the filters."
        icon={<span data-testid="icon">icon</span>}
        action={<button>Clear filters</button>}
      />,
    )

    expect(screen.getByText("No posts yet")).toBeInTheDocument()
    expect(screen.getByText("Try adjusting the filters.")).toBeInTheDocument()
    expect(screen.getByTestId("icon")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument()
  })

  test("it renders nothing for the parts that were not given", () => {
    const { container } = render(<EmptyState />)

    expect(container.querySelector('[data-slot="empty-state-title"]')).toBeNull()
    expect(container.querySelector('[data-slot="empty-state-description"]')).toBeNull()
    expect(container.querySelector('[data-slot="empty-state-icon"]')).toBeNull()
    expect(container.querySelector('[data-slot="empty-state-action"]')).toBeNull()
  })

  test("the title is a heading so it is findable without the exact text", () => {
    render(<EmptyState title="No posts yet" />)

    expect(screen.getByRole("heading", { name: "No posts yet" })).toBeInTheDocument()
  })

  test("the description is quiet text", () => {
    render(<EmptyState description="No results." />)

    expect(screen.getByText("No results.")).toHaveClass("text-quiet")
  })

  test("it is centred, with breathing room", () => {
    render(<EmptyState title="Empty" data-testid="empty" />)

    const empty = screen.getByTestId("empty")
    expect(empty).toHaveClass("items-center", "text-center", "px-6", "py-12")
  })

  test("it carries data-slots for its parts and passes the rest through", () => {
    render(<EmptyState id="empty" data-testid="empty" title="Empty" />)

    const empty = screen.getByTestId("empty")
    expect(empty).toHaveAttribute("data-slot", "empty-state")
    expect(empty).toHaveAttribute("id", "empty")
    expect(screen.getByText("Empty")).toHaveAttribute("data-slot", "empty-state-title")
  })
})

describe("overriding it from outside", () => {
  test("className merges with the centred layout rather than replacing it", () => {
    render(<EmptyState title="Empty" className="py-6" data-testid="empty" />)

    const empty = screen.getByTestId("empty")
    expect(empty).toHaveClass("py-6")
    expect(empty).not.toHaveClass("py-12")
    expect(empty).toHaveClass("items-center", "text-center")
  })
})

test("the whole state passes the accessibility checker", async () => {
  const { container } = render(
    <EmptyState
      title="No posts yet"
      description="Try adjusting the filters."
      icon={<span aria-hidden="true">icon</span>}
      action={<button>Clear filters</button>}
    />,
  )

  expect(await axe(container)).toHaveNoViolations()
})
