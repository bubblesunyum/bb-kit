import type { Post } from "@/examples/post"

/**
 * The content every story that shows text or a list should use. Tidy sample
 * copy never overflows, never wraps badly and never has a hole in it, so it
 * proves nothing — these values are the ones that catch clipping.
 *
 * Tests use them too, so a fix made because a story looked wrong has somewhere
 * to be pinned down.
 */
export const AWKWARD = {
  empty: "",
  oneCharacter: "x",
  longTitle:
    "A title that keeps going well past the point where any reasonable layout " +
    "would have wrapped it, because two hundred characters is what a real " +
    "person eventually pastes into a field",
  unbreakableWord: "supercalifragilisticexpialidociousandthensomemoreletters".padEnd(60, "x"),
  // A real date, an absent one, and one far enough out to change the format.
  date: "2026-03-14",
  missingDate: undefined,
  missingImage: undefined,
} as const

// Above TAG_SETS rather than with the other constants at the bottom: TAG_SETS
// reads it during module evaluation, and a const below would still be in its
// temporal dead zone.
const TAG_POOL = [
  "typescript",
  "react",
  "css",
  "design",
  "tooling",
  "accessibility",
  "performance",
  "testing",
]

/** 0, 1, 3 and 24 tags — one row, a short row, and one that has to wrap. */
export const TAG_SETS = {
  none: [],
  one: ["typescript"],
  few: ["typescript", "react", "css"],
  many: Array.from({ length: 24 }, (_, i) => TAG_POOL[i % TAG_POOL.length] + (i >= TAG_POOL.length ? `-${i}` : "")),
} satisfies Record<string, string[]>

export function awkwardItems(): AwkwardItem[] {
  return [
    { id: "empty", title: AWKWARD.empty, tags: TAG_SETS.none, date: AWKWARD.missingDate },
    { id: "one-character", title: AWKWARD.oneCharacter, tags: TAG_SETS.one, date: AWKWARD.date },
    { id: "long-title", title: AWKWARD.longTitle, tags: TAG_SETS.many, date: AWKWARD.date },
    { id: "unbreakable", title: AWKWARD.unbreakableWord, tags: TAG_SETS.few, date: AWKWARD.missingDate },
  ]
}

export type AwkwardItem = {
  id: string
  title: string
  tags: readonly string[]
  date: string | undefined
}

/**
 * The same awkwardness in the shape the post examples take: an empty title, a
 * two-hundred-character one, one unbreakable word, a missing cover and a
 * missing date, and a tag row long enough to wrap twice.
 */
export function awkwardPosts(): Post[] {
  return [
    { href: "#empty", title: AWKWARD.empty, excerpt: AWKWARD.empty, tags: TAG_SETS.none },
    {
      href: "#long",
      title: AWKWARD.longTitle,
      excerpt: AWKWARD.longTitle,
      tags: TAG_SETS.many,
      date: AWKWARD.date,
      cover: COVER,
    },
    {
      href: "#unbreakable",
      title: AWKWARD.unbreakableWord,
      excerpt: AWKWARD.unbreakableWord,
      tags: TAG_SETS.few,
      cover: COVER,
    },
    {
      href: "#one-character",
      title: AWKWARD.oneCharacter,
      excerpt: AWKWARD.oneCharacter,
      tags: TAG_SETS.one,
      date: AWKWARD.date,
    },
  ]
}

// The one placeholder every story already uses, rather than a second.
const COVER = "/story-cover.svg"
