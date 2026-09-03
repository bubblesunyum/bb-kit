import { describe, expect, test } from "vitest"

import {
  collectTags,
  collectTagsWithSelection,
  filterItems,
  normalizeText,
  toggleTag,
  type Accessors,
} from "./filtering"

describe("filterItems", () => {
  test("nothing selected hands back the very same array", () => {
    const items = posts()

    expect(filterItems(items, {}, ACCESSORS)).toBe(items)
    expect(filterItems(items, { text: "", tags: [] }, ACCESSORS)).toBe(items)
  })

  test("whitespace-only text counts as nothing typed", () => {
    const items = posts()

    expect(filterItems(items, { text: "   " }, ACCESSORS)).toBe(items)
  })

  test("text matches anywhere, not only at word starts", () => {
    expect(titles(filterItems(posts(), { text: "sign" }, ACCESSORS))).toEqual([
      "Designing tokens",
      "A design system",
    ])
  })

  test("text ignores case", () => {
    expect(titles(filterItems(posts(), { text: "DESIGN SYSTEM" }, ACCESSORS))).toEqual([
      "A design system",
    ])
  })

  test("text ignores accents in both directions", () => {
    const items = [{ title: "Café culture", tags: [] }]

    expect(filterItems(items, { text: "cafe" }, ACCESSORS)).toHaveLength(1)
    expect(filterItems([{ title: "Cafe culture", tags: [] }], { text: "café" }, ACCESSORS)).toHaveLength(1)
  })

  test("the query is trimmed, so a stray space still finds the word", () => {
    expect(titles(filterItems(posts(), { text: "  tokens  " }, ACCESSORS))).toEqual([
      "Designing tokens",
    ])
  })

  test("output preserves input order rather than the order of the matches", () => {
    expect(titles(filterItems(posts(), { tags: ["css"] }, ACCESSORS))).toEqual([
      "Designing tokens",
      "Cascade layers",
    ])
  })

  test("several tags narrow without being asked to", () => {
    expect(titles(filterItems(posts(), { tags: ["css", "design"] }, ACCESSORS))).toEqual([
      "Designing tokens",
    ])
  })

  test("match any widens instead", () => {
    expect(titles(filterItems(posts(), { tags: ["css", "testing"], match: "any" }, ACCESSORS))).toEqual([
      "Designing tokens",
      "Cascade layers",
      "Testing hooks",
    ])
  })

  test("text and tags combine with and", () => {
    expect(titles(filterItems(posts(), { text: "design", tags: ["css"] }, ACCESSORS))).toEqual([
      "Designing tokens",
    ])
  })

  test("tag matching is exact and case-sensitive", () => {
    expect(filterItems(posts(), { tags: ["CSS"] }, ACCESSORS)).toEqual([])
  })

  test("an item with no tags at all is not a match for one", () => {
    expect(filterItems([{ title: "Untagged", tags: undefined }], { tags: ["css"] }, ACCESSORS)).toEqual([])
  })

  // Silently keeping everything would read as a filter that stopped working.
  test("text with no getText matches nothing", () => {
    expect(filterItems(posts(), { text: "design" }, { getTags: (post) => post.tags })).toEqual([])
  })
})

describe("normalizeText", () => {
  test("it strips Latin combining marks", () => {
    expect(normalizeText("Ünïcôde")).toBe("unicode")
  })

  /* The one detail no ASCII test can catch: decomposing splits a Korean
     syllable into its parts, so without the recompose step this would compare
     split text against unsplit text and match nothing. */
  test("it recomposes, so Korean survives the round trip", () => {
    expect(normalizeText("한국어")).toBe("한국어")
    expect(normalizeText("한국어").includes("한국")).toBe(true)
  })

  test("filtering finds Korean text, which is what the recompose is for", () => {
    const items = [{ title: "한국어 타이포그래피", tags: [] }]

    expect(filterItems(items, { text: "한국" }, ACCESSORS)).toHaveLength(1)
  })
})

describe("collectTags", () => {
  test("it counts every item, whatever is selected", () => {
    expect(collectTags(posts(), ACCESSORS)).toEqual([
      { tag: "css", count: 2 },
      { tag: "design", count: 2 },
      { tag: "testing", count: 1 },
      { tag: "typescript", count: 1 },
    ])
  })

  test("count first, then alphabetically on a tie", () => {
    const items = [
      { title: "", tags: ["zebra", "apple"] },
      { title: "", tags: ["zebra", "apple", "mango"] },
    ]

    expect(collectTags(items, ACCESSORS).map((one) => one.tag)).toEqual(["apple", "zebra", "mango"])
  })

  test("a tag twice on one item counts once", () => {
    const items = [{ title: "", tags: ["css", "css", "css"] }]

    expect(collectTags(items, ACCESSORS)).toEqual([{ tag: "css", count: 1 }])
  })

  test("no items, no tags", () => {
    expect(collectTags([], ACCESSORS)).toEqual([])
  })
})

describe("collectTagsWithSelection", () => {
  test("with nothing selected it agrees with collectTags", () => {
    const marked = collectTagsWithSelection(posts(), {}, ACCESSORS)

    expect(marked.map(({ tag, count }) => ({ tag, count }))).toEqual(collectTags(posts(), ACCESSORS))
    expect(marked.every((one) => !one.selected && !one.disabled)).toBe(true)
  })

  test("it recounts against the criteria in force", () => {
    const marked = collectTagsWithSelection(posts(), { tags: ["css"] }, ACCESSORS)

    expect(marked).toEqual([
      { tag: "css", count: 2, selected: true, disabled: false },
      { tag: "design", count: 1, selected: false, disabled: false },
      { tag: "testing", count: 0, selected: false, disabled: true },
      { tag: "typescript", count: 0, selected: false, disabled: true },
    ])
  })

  test("a tag that would leave nothing is disabled, and stays in the row to be greyed out", () => {
    const marked = collectTagsWithSelection(posts(), { tags: ["testing"] }, ACCESSORS)
    const css = marked.find((one) => one.tag === "css")

    expect(css).toEqual({ tag: "css", count: 0, selected: false, disabled: true })
  })

  // Otherwise a tag greys out under the finger that just turned it on.
  test("a selected tag is never disabled, even when it leaves one result", () => {
    const marked = collectTagsWithSelection(posts(), { tags: ["css", "design"] }, ACCESSORS)

    expect(marked.filter((one) => one.selected)).toEqual([
      { tag: "css", count: 1, selected: true, disabled: false },
      { tag: "design", count: 1, selected: true, disabled: false },
    ])
  })

  test("the text narrows the counts too", () => {
    const marked = collectTagsWithSelection(posts(), { text: "tokens" }, ACCESSORS)

    expect(marked.find((one) => one.tag === "css")).toEqual({
      tag: "css",
      count: 1,
      selected: false,
      disabled: false,
    })
    expect(marked.find((one) => one.tag === "testing")?.disabled).toBe(true)
  })

  /* Adding a tag under widening can only ever add results, so the greying out
     that narrowing gets for free does almost nothing here — which is worth
     pinning down rather than discovering. */
  test("under match any, adding a tag to a selection disables nothing", () => {
    const marked = collectTagsWithSelection(posts(), { tags: ["css"], match: "any" }, ACCESSORS)

    expect(marked.some((one) => one.disabled)).toBe(false)
  })

  test("it is ordered by the recounted numbers, not the original ones", () => {
    const marked = collectTagsWithSelection(posts(), { tags: ["testing"] }, ACCESSORS)

    expect(marked.map((one) => one.tag)).toEqual(["testing", "typescript", "css", "design"])
  })
})

describe("toggleTag", () => {
  test("it adds a tag that is off", () => {
    expect(toggleTag(["css"], "design")).toEqual(["css", "design"])
  })

  test("it removes a tag that is on", () => {
    expect(toggleTag(["css", "design"], "css")).toEqual(["design"])
  })

  test("it never writes to what it was given", () => {
    const selected = Object.freeze(["css"])

    expect(toggleTag(selected, "design")).not.toBe(selected)
    expect(selected).toEqual(["css"])
  })
})

type Post = { title: string; tags: readonly string[] | undefined }

function posts(): Post[] {
  return [
    { title: "Designing tokens", tags: ["css", "design"] },
    { title: "Cascade layers", tags: ["css"] },
    { title: "A design system", tags: ["design"] },
    { title: "Testing hooks", tags: ["testing", "typescript"] },
  ]
}

function titles(items: readonly Post[]): string[] {
  return items.map((post) => post.title)
}

const ACCESSORS: Accessors<Post> = {
  getTags: (post) => post.tags,
  getText: (post) => post.title,
}
