import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

import { Surface } from "./surface"

/**
 * A standalone box with content parts. It is a `Surface` with the raised form
 * as its default, laid out as a column, plus the one thing `CardLink` needs:
 * `position: relative`, so a link inside can stretch to cover the whole card.
 *
 * A card is a card wherever it is. A row inside a list is a `ListItem` — same
 * parts, different wrapper — because a list row is only valid inside a list.
 */
export function Card({ variant = "raised", className, ...props }: CardProps) {
  return (
    <Surface
      variant={variant}
      {...props}
      data-slot="card"
      /* relative lives here rather than on CardLink: put it on the link and the
         stretched overlay would cover only the link's own box, which is exactly
         the bug the technique exists to avoid. */
      className={cn("relative flex flex-col gap-3", className)}
    />
  )
}

/**
 * The picture at the top. It bleeds to the card's edges by cancelling the
 * card's padding — `Surface` owns that padding, because a box whose content
 * touches its own border is always wrong, so the media is what has to reach
 * back out.
 *
 * Which edges it reaches depends on where it sits: first in the card it takes
 * the top and rounds the top corners, last it takes the bottom, and on its own
 * it takes both.
 */
export function CardMedia({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="card-media"
      className={cn(
        "-mx-4 overflow-hidden first:-mt-4 first:rounded-t-lg last:-mb-4 last:rounded-b-lg",
        "[&_img]:block [&_img]:w-full [&_img]:object-cover",
        className,
      )}
    />
  )
}

/**
 * The title block — and it renders no heading of its own. Put an `H2` or `H3`
 * inside it, at the level the surrounding page actually needs; a level
 * hardcoded here would be wrong about half the time.
 */
export function CardTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} data-slot="card-title" className={cn("flex flex-col gap-1", className)} />
  )
}

/** The body. It takes the leftover height, so a footer sits at the bottom. */
export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="card-body"
      className={cn("flex flex-1 flex-col gap-2", className)}
    />
  )
}

/** The row along the bottom: actions, tags, a date. It wraps rather than spills. */
export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="card-footer"
      className={cn("flex flex-wrap items-center gap-2", className)}
    />
  )
}

type CardProps = ComponentProps<typeof Surface>
