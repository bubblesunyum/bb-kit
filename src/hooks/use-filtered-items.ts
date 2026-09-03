"use client"

import { useMemo } from "react"

import { filterItems, type Accessors, type Criteria } from "@/lib/filtering"

import { useDelayedValue } from "./use-delayed-value"

/**
 * `filterItems`, memoized, with the typing caught up to.
 *
 * **Only the text is delayed.** The caller's own input value is never touched,
 * so the field stays immediate — a delayed input feels broken rather than
 * fast. Tags are not delayed either: a click is one event, not a stream, and
 * waiting 200ms after one looks like a dropped press.
 *
 * **Hoist the accessors** — a module constant, or `useCallback`. Written
 * inline they are new functions on every render, and the memo below then has
 * nothing to hold on to and refilters every time.
 */
export function useFilteredItems<T>(
  items: readonly T[],
  criteria: Criteria = {},
  accessors: Accessors<T> = {},
): T[] {
  const text = useDelayedValue(criteria.text ?? "", DELAY)
  const tags = criteria.tags ?? EMPTY
  const match = criteria.match ?? "all"

  /* The two functions rather than the object holding them: `accessors` is an
     object literal at nearly every call site and would be new every render.
     Keys rather than the arrays for the same reason — `tags={[]}` written
     inline is a different array each time and the same selection. */
  const { getTags, getText } = accessors
  const key = JSON.stringify(tags)

  return useMemo(
    () => filterItems(items, { text, tags, match }, { getTags, getText }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` stands in for `tags`.
    [items, text, key, match, getTags, getText],
  )
}

// Long enough to skip the letters in the middle of a word, short enough that
// the results are already there when the reader looks up from the keyboard.
const DELAY = 200

const EMPTY: readonly string[] = Object.freeze([])
