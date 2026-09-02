import { Slot } from "@radix-ui/react-slot"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

import { Surface } from "./surface"

/**
 * One row inside a `List`. It is a `Surface` in the plain form — no border, no
 * shadow — because rows sit against each other and a list of outlined boxes
 * reads as a stack of unrelated things.
 *
 * It renders an `<li>`, so it is only valid inside a list. A box that stands on
 * its own is a `Card`: same parts, different wrapper, and that is the whole
 * difference between them.
 */
export function ListItem({ variant = "plain", asChild = false, className, ...props }: ListItemProps) {
  /* asChild replaces the row element rather than the list: whatever you pass
     should still be an <li>, because a <ul> with an <a> directly inside it is
     not a list any more. For a row that is entirely a link, reach for CardLink
     instead — same reasoning as Card. */
  const Row = asChild ? Slot : "li"

  return (
    <Surface
      asChild
      variant={variant}
      /* relative for the same reason Card sets it: a CardLink inside a row has
         to have something to cover, and a row is exactly as likely to be
         entirely a link as a card is. */
      className={cn("relative flex flex-col gap-2", className)}
    >
      <Row {...props} data-slot="list-item" />
    </Surface>
  )
}

/**
 * A row that looks like a card — `ListItem` in the raised form. A named
 * wrapper, not a separate component: two ways to say one thing is what the
 * variant table exists to prevent.
 */
export function CardListItem(props: FormProps) {
  return <ListItem variant="raised" {...props} />
}

type ListItemProps = ComponentProps<"li"> & {
  variant?: Variant
  /** Render the single child as the row. It should still be an `<li>`. */
  asChild?: boolean
}

/** The wrapper picks the variant, so no caller can pass a second one. */
type FormProps = Omit<ListItemProps, "variant">

type Variant = NonNullable<ComponentProps<typeof Surface>["variant"]>
