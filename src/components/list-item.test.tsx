import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { CardListItem, ListItem } from "./list-item"

function inList(row: React.ReactNode) {
  return render(<ul>{row}</ul>)
}

describe("what a ListItem is", () => {
  // A row is only valid inside a list, which is why this is an <li> and Card
  // is not.
  test("it is a real list item", () => {
    inList(<ListItem>a row</ListItem>)

    expect(screen.getByRole("listitem")).toBeInTheDocument()
  })

  test("it is a plain Surface — no border and no shadow", () => {
    inList(<ListItem>a row</ListItem>)

    const row = screen.getByRole("listitem")
    expect(row).toHaveClass("bg-card")
    expect(row).not.toHaveClass("border")
    expect(row).not.toHaveClass("shadow-xs")
  })

  test("it is positioned, so a CardLink inside has something to cover", () => {
    inList(<ListItem>a row</ListItem>)

    expect(screen.getByRole("listitem")).toHaveClass("relative")
  })

  test("it carries its own data-slot and passes the rest through", () => {
    inList(<ListItem id="row-1">a row</ListItem>)

    const row = screen.getByRole("listitem")
    expect(row).toHaveAttribute("data-slot", "list-item")
    expect(row).toHaveAttribute("id", "row-1")
  })
})

describe("CardListItem", () => {
  test("it is a row that looks like a card", () => {
    inList(<CardListItem>a row</CardListItem>)

    expect(screen.getByRole("listitem")).toHaveClass("shadow-xs")
  })

  // A named wrapper, not a second component: two ways to say one thing is what
  // the variant table exists to prevent.
  test("it renders exactly what the variant does", () => {
    const { container: wrapped } = inList(<CardListItem>a row</CardListItem>)
    const { container: direct } = inList(<ListItem variant="raised">a row</ListItem>)

    expect(wrapped.innerHTML).toBe(direct.innerHTML)
  })
})

describe("standing in for another element", () => {
  test("asChild replaces the row, and the surface classes land on it", () => {
    render(
      <ul>
        <ListItem asChild variant="outline">
          <li data-testid="row">a row of my own</li>
        </ListItem>
      </ul>,
    )

    const row = screen.getByTestId("row")
    expect(row).toHaveClass("bg-card", "border", "relative")
    expect(row).toHaveAttribute("data-slot", "list-item")
  })
})

describe("overriding it from outside", () => {
  test("className wins over what it sets", () => {
    inList(<ListItem className="gap-0 p-0" />)

    const row = screen.getByRole("listitem")
    expect(row).toHaveClass("gap-0", "p-0")
    expect(row).not.toHaveClass("gap-2")
    expect(row).not.toHaveClass("p-4")
  })
})
