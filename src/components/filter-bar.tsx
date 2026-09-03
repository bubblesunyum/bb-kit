"use client"

import type { ComponentProps } from "react"

import { toggleTag } from "@/lib/filtering"

import { Badge } from "./badge"
import { SearchField } from "./search-field"
import { HStack, VStack } from "./stack"

/**
 * The search field and the row of tags, together — where `SearchField`, `Badge`
 * and the filtering functions finally meet.
 *
 * It holds nothing. `query` and `selected` are the caller's, because the same
 * two values are what `useFilteredItems` needs, and a bar that kept its own
 * copy would leave the caller reading the filter state back out of the UI.
 *
 * `tags` takes plain strings, or the objects `collectTagsWithSelection`
 * returns — pass those and a tag that would leave the reader with nothing
 * greys out before they click it. Nothing to configure either way: the shape
 * you hand it is the behaviour you get.
 */
export function FilterBar({
  tags,
  selected,
  onSelectedChange,
  query,
  onQueryChange,
  className,
  ...props
}: FilterBarProps) {
  const options = tags.map((tag) => (typeof tag === "string" ? { tag } : tag))

  return (
    <VStack gap={3} data-slot="filter-bar" className={className} {...props}>
      <SearchField value={query} onValueChange={onQueryChange} data-slot="filter-bar-search" />

      {options.length > 0 ? (
        /* A group with a name, so a screen reader reaching the first tag is
           told what the row of pressed buttons it has arrived in is for. */
        <HStack
          asChild
          gap={2}
          /* The row wraps rather than scrolls: a tag pushed off the end of a
             scroller is a filter the reader never learns exists. */
          className="flex-wrap"
        >
          <div role="group" aria-label="Filter by tag" data-slot="filter-bar-tags">
            {options.map(({ tag, disabled }) => (
              <Badge
                key={tag}
                data-slot="filter-bar-tag"
                selected={selected.includes(tag)}
                /* Never disable a tag that is on. Greying out the tag under
                   the finger that just pressed it reads as a bug, and it also
                   traps the reader in a filter they cannot lift. */
                disabled={disabled && !selected.includes(tag)}
                onSelectedChange={() => onSelectedChange(toggleTag(selected, tag))}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </HStack>
      ) : null}
    </VStack>
  )
}

/**
 * `onSelectedChange` is handed the whole new selection rather than the tag that
 * moved, so the caller stores what it is given instead of reimplementing
 * `toggleTag` at every call site.
 */
type FilterBarProps = Omit<ComponentProps<"div">, "children"> & {
  tags: readonly TagOption[]
  selected: readonly string[]
  onSelectedChange: (next: string[]) => void
  query: string
  onQueryChange: (next: string) => void
}

/**
 * A bare tag, or anything carrying a `tag` and a `disabled` — which is what
 * `collectTagsWithSelection` returns, so its output passes straight through.
 */
type TagOption = string | { tag: string; disabled?: boolean }
