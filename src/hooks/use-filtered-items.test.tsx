import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import type { Accessors } from "@/lib/filtering"

import { useDelayedValue } from "./use-delayed-value"
import { useFilteredItems } from "./use-filtered-items"

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("useDelayedValue", () => {
  // A first render that waits is a page that arrives blank for no reason.
  test("the first value is not delayed", () => {
    const { result } = renderHook(() => useDelayedValue("design"))

    expect(result.current).toBe("design")
  })

  test("a change waits for the delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDelayedValue(value, 200), {
      initialProps: { value: "" },
    })

    rerender({ value: "de" })
    expect(result.current).toBe("")

    act(() => void vi.advanceTimersByTime(200))
    expect(result.current).toBe("de")
  })

  test("only the last of a burst arrives", () => {
    const { result, rerender } = renderHook(({ value }) => useDelayedValue(value, 200), {
      initialProps: { value: "" },
    })

    for (const value of ["d", "de", "des"]) {
      rerender({ value })
      act(() => void vi.advanceTimersByTime(100))
    }

    expect(result.current).toBe("")

    act(() => void vi.advanceTimersByTime(200))
    expect(result.current).toBe("des")
  })

  test("a value that comes back to where it was never lands", () => {
    const { result, rerender } = renderHook(({ value }) => useDelayedValue(value, 200), {
      initialProps: { value: "css" },
    })

    rerender({ value: "cs" })
    act(() => void vi.advanceTimersByTime(100))
    rerender({ value: "css" })
    act(() => void vi.advanceTimersByTime(500))

    expect(result.current).toBe("css")
  })
})

describe("useFilteredItems", () => {
  test("it filters on the first render, without waiting", () => {
    const { result } = renderHook(() => useFilteredItems(POSTS, { text: "tokens" }, ACCESSORS))

    expect(titles(result.current.items)).toEqual(["Designing tokens"])
  })

  test("typing waits, so the list does not thrash through every letter", () => {
    const { result, rerender } = renderHook(({ text }) => useFilteredItems(POSTS, { text }, ACCESSORS), {
      initialProps: { text: "" },
    })

    rerender({ text: "tok" })
    expect(result.current.items).toHaveLength(4)

    act(() => void vi.advanceTimersByTime(200))
    expect(titles(result.current.items)).toEqual(["Designing tokens"])
  })

  // A click is one event, not a stream — a delay after one reads as a miss.
  test("a tag lands immediately", () => {
    const { result, rerender } = renderHook(
      ({ tags }) => useFilteredItems(POSTS, { tags }, ACCESSORS),
      { initialProps: { tags: [] as string[] } },
    )

    rerender({ tags: ["testing"] })

    expect(titles(result.current.items)).toEqual(["Testing hooks"])
  })

  // An inline array is a new one every render and the same selection, which
  // is the whole reason the tags are keyed rather than depended on.
  test("the same array comes back while the criteria hold still", () => {
    const { result, rerender } = renderHook(() => useFilteredItems(POSTS, { tags: ["css"] }, ACCESSORS))
    const first = result.current.items

    rerender()

    expect(result.current.items).toBe(first)
    expect(titles(first)).toEqual(["Designing tokens", "Cascade layers"])
  })

  test("nothing selected hands back the items themselves", () => {
    const { result } = renderHook(() => useFilteredItems(POSTS, {}, ACCESSORS))

    expect(result.current.items).toBe(POSTS)
  })

  /* A tag row counted from the raw criteria would grey out a tag a whole
     keystroke before the results contradicting it left the screen. */
  test("the criteria it hands back are the delayed ones the items match", () => {
    const { result, rerender } = renderHook(({ text }) => useFilteredItems(POSTS, { text }, ACCESSORS), {
      initialProps: { text: "" },
    })

    rerender({ text: "zzz" })
    expect(result.current.criteria.text).toBe("")
    expect(result.current.items).toHaveLength(4)

    act(() => void vi.advanceTimersByTime(200))
    expect(result.current.criteria.text).toBe("zzz")
    expect(result.current.items).toHaveLength(0)
  })

  test("the tags and the match it hands back are the ones it used", () => {
    const { result } = renderHook(() =>
      useFilteredItems(POSTS, { tags: ["css"], match: "any" }, ACCESSORS),
    )

    expect(result.current.criteria).toEqual({ text: "", tags: ["css"], match: "any" })
  })
})

type Post = { title: string; tags: readonly string[] }

function titles(items: readonly Post[]): string[] {
  return items.map((post) => post.title)
}

const POSTS: readonly Post[] = [
  { title: "Designing tokens", tags: ["css", "design"] },
  { title: "Cascade layers", tags: ["css"] },
  { title: "A design system", tags: ["design"] },
  { title: "Testing hooks", tags: ["testing", "typescript"] },
]

// Hoisted, exactly as the hook asks callers to hoist theirs.
const ACCESSORS: Accessors<Post> = {
  getTags: (post) => post.tags,
  getText: (post) => post.title,
}
