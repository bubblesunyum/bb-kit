import { Slot } from "@radix-ui/react-slot"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/**
 * Makes the whole `Card` around it clickable, without wrapping the card in an
 * anchor. The obvious move — `<Card asChild><a>…` — is wrong the moment the
 * card contains anything else clickable, because interactive elements cannot
 * nest, and every post card has tags. So that is the normal case, not the edge
 * case.
 *
 * How it works: `Card` sets `position: relative`, and the link grows a
 * pseudo-element that covers it. The card is clickable everywhere, the badges
 * inside still work, and there is one link in the accessibility tree rather
 * than one per element.
 *
 * **Put it in the title, not the footer.** The overlay covers the nearest
 * positioned ancestor, and `CardFooter` is positioned — so a `CardLink` inside
 * a footer stretches over the footer alone and the rest of the card stops being
 * clickable, silently. That is the same technique working correctly in a place
 * it does not belong; there is nowhere for it to report the mistake, so it is
 * written here instead.
 *
 * Two costs, both accepted rather than bugs to fix later. Text inside a
 * stretched-link card cannot be selected, because the overlay sits on top of
 * it. And anything else interactive in the card has to sit above the overlay —
 * give it `relative` (or `isolate`), or the link swallows its clicks. Those two
 * pull in opposite directions and cannot both be had: whatever is lifted above
 * the overlay becomes a containing block for the next overlay inside it.
 */
export function CardLink({ asChild = false, className, ...props }: CardLinkProps) {
  const Component = asChild ? Slot : "a"

  return (
    <Component
      {...props}
      data-slot="card-link"
      /* The focus ring goes on the overlay rather than the link text, so
         tabbing to a card outlines the card — which is the thing that is
         actually clickable. */
      className={cn(
        "after:absolute after:inset-0 after:rounded-lg after:content-['']",
        /* No `outline-none`: in Tailwind v4 it sets --tw-outline-style to none,
           which the pseudo-element inherits, and the ring below never draws. */
        "focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus-ring",
        "hover:underline",
        className,
      )}
    />
  )
}

type CardLinkProps = ComponentProps<"a"> & {
  /** Render the single child as the link — a framework's `<Link>`, usually. */
  asChild?: boolean
}
