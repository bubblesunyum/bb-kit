import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/** Children stacked downward, with a gap you never have to ask for. */
export function VStack(props: StackProps) {
  return <Stack direction="flex-col" {...props} />
}

/**
 * The same, sideways. Alignment defaults to centre rather than stretch: a row
 * is nearly always a badge or an icon beside a line of text, and stretched they
 * come out the height of the tallest thing in the row.
 */
export function HStack({ align = "center", ...props }: StackProps) {
  return <Stack direction="flex-row" align={align} {...props} />
}

/**
 * There is deliberately no `loading` prop. The old kit's Stack swapped every
 * child for one 16px bar, so a card-sized stack collapsed to a thin line and
 * then jumped to full height when the data arrived. Callers place `Skeleton`
 * themselves, knowing the height the real content will take.
 *
 * There is no empty state either: a stack takes arbitrary children and cannot
 * tell an empty list from one child that renders nothing. `List` can, because
 * it takes data.
 */
function Stack({
  direction,
  gap = 2,
  align = "stretch",
  justify = "start",
  className,
  ...props
}: StackProps & { direction: Direction }) {
  return (
    <div
      data-slot="stack"
      className={cn("flex", direction, GAPS[gap], ALIGNS[align], JUSTIFIES[justify], className)}
      {...props}
    />
  )
}

type StackProps = ComponentProps<"div"> & {
  /** Tailwind's spacing scale, not a second scale of ours. 2 is 8px. */
  gap?: Gap
  align?: Align
  justify?: Justify
}

type Direction = "flex-col" | "flex-row"
type Gap = keyof typeof GAPS
type Align = keyof typeof ALIGNS
type Justify = keyof typeof JUSTIFIES

// Written out rather than interpolated, because Tailwind reads the source for
// whole class names and finds nothing in `gap-${n}`. Even steps keep the 8px
// rhythm; the odd ones exist for the places where half a step is right.
const GAPS = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
} as const

const ALIGNS = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
} as const

const JUSTIFIES = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
} as const
