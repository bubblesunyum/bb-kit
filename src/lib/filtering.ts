/**
 * The filtering. Plain functions — no React, no dependencies — so a route
 * handler, a build script or a test can use them as readily as a component.
 *
 * It knows nothing about posts, or about any other shape. You tell it how to
 * read tags and text out of your own objects, through `accessors`.
 *
 * Inputs are `readonly` throughout and returns are plain arrays, so nothing
 * here can write to what it was handed and every caller is free to sort what
 * it gets back.
 */

/**
 * Keeps the items that match the text *and* the tags. Output preserves input
 * order, because the order was the caller's decision and filtering is not a
 * reason to overrule it.
 *
 * Picking several tags narrows: an item must carry all of them. `match: 'any'`
 * flips that to widening for a site that wants it.
 */
export function filterItems<T>(
  items: readonly T[],
  criteria: Criteria = {},
  accessors: Accessors<T> = {},
): T[] {
  const text = query(criteria)
  const tags = criteria.tags ?? EMPTY

  /* Nothing selected hands back the very array it was given, so a `useMemo`
     or a `React.memo` above has an unchanged reference to compare and can
     skip. A copy would be the same data and would defeat all of it. */
  if (!text && tags.length === 0) return items as T[]

  const matchesText = textMatcher(text, accessors)
  const matchesTags = tagMatcher(tags, criteria.match ?? "all", accessors)

  return items.filter((item) => matchesText(item) && matchesTags(item))
}

/**
 * Every tag across the items, with how many items carry it — the counts for a
 * static tag cloud, which is why the current selection plays no part.
 *
 * Ordered by count, highest first, then alphabetically on a tie. That order is
 * what a reader sees as the order of the row, and a wrong one is not something
 * anybody can spot by eye, so it is pinned here and in the tests.
 */
export function collectTags<T>(items: readonly T[], accessors: Accessors<T> = {}): TagCount[] {
  return [...countTags(items, accessors)]
    .map(([tag, count]) => ({ tag, count }))
    .sort(byCountThenName)
}

/**
 * The same tags, recounted against the criteria currently in force, and marked
 * up for a live filter bar: `selected` for the ones that are on, `disabled`
 * for the ones that would leave the reader with nothing.
 *
 * The tags themselves come from every item, not from the matching ones — a tag
 * has to stay in the row in order to be greyed out in it.
 *
 * **A selected tag is never disabled.** The question asked is "would adding
 * this leave nothing", not "would toggling it", or a tag you just turned on
 * would grey out under your finger and read as broken.
 */
export function collectTagsWithSelection<T>(
  items: readonly T[],
  criteria: Criteria = {},
  accessors: Accessors<T> = {},
): SelectableTag[] {
  const selected = criteria.tags ?? EMPTY
  const matching = filterItems(items, criteria, accessors)
  const counts = countTags(matching, accessors)

  return collectTags(items, accessors)
    .map(({ tag }) => ({
      tag,
      count: counts.get(tag) ?? 0,
      selected: selected.includes(tag),
      /* Asking the filter itself rather than reasoning from the count: under
         `match: 'any'` adding a tag widens, so the count of it among today's
         matches says nothing about what adding it would do. */
      disabled:
        !selected.includes(tag) &&
        filterItems(items, { ...criteria, tags: [...selected, tag] }, accessors).length === 0,
    }))
    .sort(byCountThenName)
}

/** Adds the tag, or removes it if it is already on. Always a new array. */
export function toggleTag(selected: readonly string[], tag: string): string[] {
  return selected.includes(tag) ? selected.filter((one) => one !== tag) : [...selected, tag]
}

/**
 * Case and accents ignored, in three steps: decompose, drop the Latin
 * combining marks, **then recompose**.
 *
 * That last step is the one that looks redundant and is not. Decomposing
 * splits a Korean syllable into its parts, and without recomposing we would
 * compare split text against unsplit text and match nothing — breaking the
 * exact languages the accent-stripping was meant to leave alone. Every ASCII
 * test passes either way, so only this comment and the test beside it stand
 * between here and a silent bug.
 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .normalize("NFC")
    .toLowerCase()
}

/** Whitespace-only text counts as nothing typed, and " react " finds "react". */
function query(criteria: Criteria): string {
  return criteria.text?.trim() ?? ""
}

/** Matches anywhere in the text, not only at word starts. */
function textMatcher<T>(text: string, accessors: Accessors<T>): (item: T) => boolean {
  if (!text) return () => true

  const needle = normalizeText(text)

  /* No getText and text to look for means nothing can match. Silently keeping
     every item would read as a filter that stopped working. */
  const getText = accessors.getText ?? (() => "")

  return (item) => normalizeText(getText(item)).includes(needle)
}

function tagMatcher<T>(
  tags: readonly string[],
  match: Match,
  accessors: Accessors<T>,
): (item: T) => boolean {
  if (tags.length === 0) return () => true

  const getTags = accessors.getTags ?? (() => undefined)

  return (item) => {
    // Exact and case-sensitive: "React" and "react" are two tags. A consumer
    // wanting otherwise normalises in getTags, where it knows its own data.
    const carried = new Set(getTags(item) ?? EMPTY)
    return match === "any" ? tags.some((tag) => carried.has(tag)) : tags.every((tag) => carried.has(tag))
  }
}

/** Duplicate tags on one item count once, hence the set per item. */
function countTags<T>(items: readonly T[], accessors: Accessors<T>): Map<string, number> {
  const counts = new Map<string, number>()

  for (const item of items) {
    for (const tag of new Set(accessors.getTags?.(item) ?? EMPTY)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return counts
}

function byCountThenName(a: TagCount, b: TagCount): number {
  return b.count - a.count || a.tag.localeCompare(b.tag)
}

export type Criteria = {
  text?: string
  tags?: readonly string[]
  /** Default `all` — several tags narrow. `any` widens. */
  match?: Match
}

export type Accessors<T> = {
  getTags?: (item: T) => readonly string[] | undefined
  getText?: (item: T) => string
}

export type TagCount = { tag: string; count: number }

export type SelectableTag = TagCount & { selected: boolean; disabled: boolean }

type Match = "all" | "any"

const COMBINING_MARKS = /[\u0300-\u036f]/g

// One frozen empty array rather than a fresh `[]` at each of the four places
// that need a stand-in for a missing one.
const EMPTY: readonly string[] = Object.freeze([])
