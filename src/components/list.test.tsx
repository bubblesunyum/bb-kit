import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { EmptyState } from "./empty-state"
import { List } from "./list"
import { Text } from "./text"

const POSTS = ["Lists that never truncate", "Filtering without a framework", "Theming"]

function renderList(props: Partial<Parameters<typeof List<string>>[0]> = {}) {
  return render(
    <List items={POSTS} renderItem={(post) => <Text>{post}</Text>} getKey={(post) => post} {...props} />,
  )
}

describe("what a List renders", () => {
  test("it is a real list of real list items", () => {
    renderList()

    expect(screen.getByRole("list")).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(3)
  })

  // The old one silently rendered the first three items and dropped the rest.
  test("it never truncates", () => {
    const many = Array.from({ length: 40 }, (_, i) => `Post ${i}`)
    renderList({ items: many, getKey: (post) => post })

    expect(screen.getAllByRole("listitem")).toHaveLength(40)
  })

  test("renderItem returns the contents, and List supplies the row", () => {
    renderList()

    const row = screen.getAllByRole("listitem")[0]
    expect(row).toHaveAttribute("data-slot", "list-item")
    expect(row).toHaveTextContent(POSTS[0])
  })

  test("it passes the rest through and carries a data-slot", () => {
    renderList({ id: "posts" })

    const list = document.querySelector("[data-slot='list']")
    expect(list).toHaveAttribute("id", "posts")
  })
})

describe("the states, and which one wins", () => {
  test("an empty list shows the empty state, not an empty <ul>", () => {
    renderList({ items: [], empty: <EmptyState title="Nothing yet" /> })

    expect(screen.getByText("Nothing yet")).toBeInTheDocument()
    expect(screen.queryByRole("list")).not.toBeInTheDocument()
  })

  test("loading shows placeholder rows rather than the empty state", () => {
    renderList({ items: [], loading: true, empty: <EmptyState title="Nothing yet" /> })

    expect(screen.queryByText("Nothing yet")).not.toBeInTheDocument()
    expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0)
  })

  test("an error wins over loading", () => {
    renderList({ loading: true, error: <Text>Could not load posts</Text> })

    expect(screen.getByRole("alert")).toHaveTextContent("Could not load posts")
    expect(screen.queryByRole("list")).not.toBeInTheDocument()
  })

  // The old one returned early while loading, taking the header with it and
  // changing the block's height.
  test("the header survives every state", () => {
    for (const state of [
      {},
      { loading: true },
      { items: [], empty: <Text>Nothing yet</Text> },
      { error: <Text>Broken</Text> },
    ]) {
      const { unmount } = renderList({ header: <Text>Posts</Text>, ...state })

      expect(screen.getByText("Posts")).toBeInTheDocument()
      unmount()
    }
  })

  test("loading says so, for anything listening", () => {
    renderList({ loading: true })

    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true")
  })
})

describe("keys", () => {
  test("getKey is used when given", () => {
    // A reorder keeps the same DOM nodes only if the keys followed the items.
    const { rerender } = renderList()
    const [first] = screen.getAllByRole("listitem")

    rerender(
      <List
        items={[...POSTS].reverse()}
        renderItem={(post) => <Text>{post}</Text>}
        getKey={(post) => post}
      />,
    )

    expect(screen.getAllByRole("listitem").at(-1)).toBe(first)
  })

  test("without it the list still renders, keyed by index", () => {
    renderList({ getKey: undefined })

    expect(screen.getAllByRole("listitem")).toHaveLength(3)
  })
})

describe("the gap", () => {
  test("it defaults to 8px and takes Tailwind's scale", () => {
    const { rerender } = renderList()
    expect(screen.getByRole("list")).toHaveClass("gap-2")

    rerender(<List items={POSTS} renderItem={(post) => <Text>{post}</Text>} gap={6} />)
    expect(screen.getByRole("list")).toHaveClass("gap-6")
  })
})
