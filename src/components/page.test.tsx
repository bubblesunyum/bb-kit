import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { Page } from "./page"

describe("what a Page paints", () => {
  // The whole reason it exists: nothing else in the kit sets these.
  test("it paints the page background and text colour", () => {
    render(<Page data-testid="page">content</Page>)

    expect(screen.getByTestId("page")).toHaveClass("bg-page", "text-text")
  })

  // A percentage height inherits from a parent that has none, so the paint
  // would stop at the last line of text.
  test("it fills the viewport even with one line in it", () => {
    render(<Page data-testid="page">content</Page>)

    expect(screen.getByTestId("page")).toHaveClass("min-h-dvh")
  })

  test("it adds no padding or width of its own", () => {
    render(<Page data-testid="page">content</Page>)

    expect(screen.getByTestId("page").className).not.toMatch(/\b(p|px|py|max-w)-/)
  })
})

describe("overriding it from outside", () => {
  test("className wins over what it sets", () => {
    render(
      <Page className="min-h-0" data-testid="page">
        content
      </Page>,
    )

    const page = screen.getByTestId("page")
    expect(page).toHaveClass("min-h-0")
    expect(page).not.toHaveClass("min-h-dvh")
  })

  test("it carries a data-slot and passes the rest through", () => {
    render(
      <Page id="root" data-testid="page">
        content
      </Page>,
    )

    const page = screen.getByTestId("page")
    expect(page).toHaveAttribute("data-slot", "page")
    expect(page).toHaveAttribute("id", "root")
  })
})
