import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "jest-axe"
import { describe, expect, test } from "vitest"

import KitchenSinkPage from "./page"

/**
 * The pieces against each other rather than against themselves. Every other
 * test in the kit renders one component; this one renders the page and checks
 * that the filter bar, the hook, the layouts and the empty state agree.
 */
describe("the kitchen sink", () => {
  test("it opens showing every post as a card", () => {
    render(<KitchenSinkPage />)

    expect(screen.getByRole("heading", { name: "Writing", level: 1 })).toBeInTheDocument()
    expect(screen.getByText("8 of 8 posts")).toBeInTheDocument()
  })

  test("typing filters the posts, once the typing stops", async () => {
    render(<KitchenSinkPage />)

    await userEvent.type(screen.getByRole("searchbox"), "cascade")

    await waitFor(() => expect(screen.getByText("1 of 8 posts")).toBeInTheDocument())
    expect(screen.getByRole("link", { name: /Cascade layers/ })).toBeInTheDocument()
  })

  test("a tag filters immediately, with no wait at all", async () => {
    render(<KitchenSinkPage />)

    await userEvent.click(tag("typescript"))

    expect(screen.getByText("2 of 8 posts")).toBeInTheDocument()
  })

  test("two tags narrow rather than widen", async () => {
    render(<KitchenSinkPage />)

    await userEvent.click(tag("design"))
    await userEvent.click(tag("css"))

    expect(screen.getByText("2 of 8 posts")).toBeInTheDocument()
  })

  test("a tag that would leave nothing is greyed out before it is pressed", async () => {
    render(<KitchenSinkPage />)

    await userEvent.click(tag("notes"))

    expect(tag("notes")).toBeEnabled()
    expect(tag("css")).toBeDisabled()
  })

  test("filtering to nothing offers the way out, and it works", async () => {
    render(<KitchenSinkPage />)

    await userEvent.type(screen.getByRole("searchbox"), "nothing matches this")
    await waitFor(() => expect(screen.getByText("Nothing matches that")).toBeInTheDocument())

    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }))

    // The field empties at once; the results come back when the delay lapses,
    // because clearing the text is a text change like any other.
    expect(screen.getByRole("searchbox")).toHaveValue("")
    await waitFor(() => expect(screen.getByText("8 of 8 posts")).toBeInTheDocument())
  })

  test("the layout choice swaps cards for rows without touching the filter", async () => {
    const { container } = render(<KitchenSinkPage />)
    const layout = screen.getByRole("group", { name: "Layout" })

    await userEvent.click(tag("css"))
    expect(container.querySelector("ul")).not.toBeInTheDocument()

    await userEvent.click(within(layout).getByRole("button", { name: "Rows" }))

    expect(container.querySelectorAll("li")).toHaveLength(3)
    expect(screen.getByText("3 of 8 posts")).toBeInTheDocument()
  })

  test("it has no accessibility violations", async () => {
    const { container } = render(<KitchenSinkPage />)

    expect(await axe(container)).toHaveNoViolations()
  })
})

/** The tag toggles live in their own named group, away from the layout ones. */
function tag(name: string) {
  return within(screen.getByRole("group", { name: "Filter by tag" })).getByRole("button", { name })
}
