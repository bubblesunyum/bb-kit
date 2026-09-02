import type { ComponentProps, Key, ReactNode } from "react"

import { cn } from "@/lib/utils"

import { ListItem } from "./list-item"
import { Skeleton } from "./skeleton"
import { VStack } from "./stack"

/**
 * A proper list. It owns the gap between rows, the empty state and the loading
 * state — which the stacks deliberately do not, because a stack takes arbitrary
 * children and cannot tell an empty list from one child that renders nothing.
 * `List` takes data, so it can.
 *
 * `renderItem` returns the *contents* of a row, not the row element: `List`
 * wraps each one in a `ListItem`, so every row is a real `<li>` and the gap is
 * applied in one place.
 *
 * **It never truncates.** The old kit's list silently rendered the first three
 * items and dropped the rest, and its loading state returned early, taking the
 * header with it and changing the block's height. This one keeps the header in
 * every state and holds a list-shaped height while loading.
 */
export function List<T>({
  items,
  renderItem,
  getKey,
  loading = false,
  error,
  empty,
  header,
  gap = 2,
  className,
  ...props
}: ListProps<T>) {
  return (
    <VStack gap={3} className={className} {...props} data-slot="list">
      {header ? <div data-slot="list-header">{header}</div> : null}
      {/* Precedence, in this order: an error is worth saying even mid-refresh,
          and an empty list is only empty once we know there is nothing coming. */}
      {error ? (
        <div data-slot="list-error" role="alert">
          {error}
        </div>
      ) : loading ? (
        <Rows gap={gap} aria-busy="true">
          {PLACEHOLDERS.map((placeholder) => (
            <ListItem key={placeholder}>
              <Skeleton lines={2} />
            </ListItem>
          ))}
        </Rows>
      ) : items.length === 0 ? (
        <div data-slot="list-empty">{empty}</div>
      ) : (
        <Rows gap={gap}>
          {items.map((item, index) => (
            <ListItem key={getKey ? getKey(item, index) : index}>
              {renderItem(item, index)}
            </ListItem>
          ))}
        </Rows>
      )}
    </VStack>
  )
}

/**
 * The `<ul>` itself. It is a `VStack` standing in for the list element rather
 * than a div wrapping one, so the gap between rows comes off the same scale as
 * every other gap in the kit instead of a second table kept in step by hand.
 */
function Rows({ gap, children, ...props }: RowsProps) {
  return (
    <VStack asChild gap={gap}>
      <ul {...props} data-slot="list-rows">
        {children}
      </ul>
    </VStack>
  )
}

type ListProps<T> = Omit<ComponentProps<"div">, "children"> & {
  items: readonly T[]
  /** The contents of a row, not the row itself. `List` supplies the `ListItem`. */
  renderItem: (item: T, index: number) => ReactNode
  /** Falls back to the index, which is wrong the moment the list is reordered. */
  getKey?: (item: T, index: number) => Key
  loading?: boolean
  error?: ReactNode
  empty?: ReactNode
  header?: ReactNode
  gap?: Gap
}

type RowsProps = ComponentProps<"ul"> & { gap: Gap }

type Gap = NonNullable<ComponentProps<typeof VStack>["gap"]>

// Three, because it reads as a list rather than as one thing still arriving,
// and it is short enough not to claim a height the real data will not fill.
const PLACEHOLDERS = [0, 1, 2]
