import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "jest-axe"
import { describe, expect, test, vi } from "vitest"

import { collectTagsWithSelection } from "@/lib/filtering"
import { TAG_SETS } from "@/test/awkward-content"

import { FilterBar } from "./filter-bar"

describe("what a FilterBar is", () => {
  test("a search field and a tag for each one it is given", () => {
    renderBar({ tags: TAG_SETS.few })

    expect(screen.getByRole("searchbox")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(3)
  })

  test("the row of tags is a named group", () => {
    renderBar({ tags: TAG_SETS.few })

    expect(screen.getByRole("group", { name: "Filter by tag" })).toBeInTheDocument()
  })

  test("no tags, no row — the search field is still there", () => {
    renderBar({ tags: [] })

    expect(screen.getByRole("searchbox")).toBeInTheDocument()
    expect(screen.queryByRole("group")).not.toBeInTheDocument()
  })

  test("every part carries a data-slot", () => {
    const { container } = renderBar({ tags: TAG_SETS.few })

    for (const slot of ["filter-bar", "filter-bar-search", "filter-bar-tags", "filter-bar-tag"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).toBeInTheDocument()
    }
  })

  test("it has no accessibility violations", async () => {
    const { container } = renderBar({ tags: TAG_SETS.few, selected: ["react"] })

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe("the caller owns the filter state", () => {
  test("a selected tag reads as pressed", () => {
    renderBar({ tags: TAG_SETS.few, selected: ["react"] })

    expect(screen.getByRole("button", { name: "react", pressed: true })).toBeInTheDocument()
  })

  test("pressing a tag asks for it added", async () => {
    const onSelectedChange = vi.fn()
    renderBar({ tags: TAG_SETS.few, selected: ["react"], onSelectedChange })

    await userEvent.click(screen.getByRole("button", { name: "css" }))

    expect(onSelectedChange).toHaveBeenCalledWith(["react", "css"])
  })

  test("pressing a tag that is on asks for it removed", async () => {
    const onSelectedChange = vi.fn()
    renderBar({ tags: TAG_SETS.few, selected: ["react", "css"], onSelectedChange })

    await userEvent.click(screen.getByRole("button", { name: "react" }))

    expect(onSelectedChange).toHaveBeenCalledWith(["css"])
  })

  test("typing asks for the new query", async () => {
    const onQueryChange = vi.fn()
    renderBar({ tags: TAG_SETS.few, onQueryChange })

    await userEvent.type(screen.getByRole("searchbox"), "d")

    expect(onQueryChange).toHaveBeenCalledWith("d")
  })

  test("it shows the query it is given", () => {
    renderBar({ tags: TAG_SETS.few, query: "design" })

    expect(screen.getByRole("searchbox")).toHaveValue("design")
  })
})

describe("greying out the tags that lead nowhere", () => {
  test("what collectTagsWithSelection returns passes straight through", () => {
    const items = [
      { title: "Designing tokens", tags: ["css", "design"] },
      { title: "Testing hooks", tags: ["testing"] },
    ]
    const selected = ["css"]
    const tags = collectTagsWithSelection(items, { tags: selected }, { getTags: (item) => item.tags })

    renderBar({ tags, selected })

    expect(screen.getByRole("button", { name: "testing" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "design" })).toBeEnabled()
  })

  // Otherwise the tag greys out under the finger that pressed it, and the
  // reader is stuck inside a filter they cannot lift.
  test("a selected tag is never disabled, whatever it was handed", () => {
    renderBar({ tags: [{ tag: "react", disabled: true }], selected: ["react"] })

    expect(screen.getByRole("button", { name: "react" })).toBeEnabled()
  })

  test("plain strings are never disabled", () => {
    renderBar({ tags: TAG_SETS.few })

    for (const tag of TAG_SETS.few) {
      expect(screen.getByRole("button", { name: tag })).toBeEnabled()
    }
  })
})

function renderBar(props: Partial<Parameters<typeof FilterBar>[0]> = {}) {
  return render(
    <FilterBar
      tags={[]}
      selected={[]}
      onSelectedChange={() => {}}
      query=""
      onQueryChange={() => {}}
      {...props}
    />,
  )
}
