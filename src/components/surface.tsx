import { Slot } from "@radix-ui/react-slot"
import type { ComponentProps } from "react"

import { classFor } from "@/lib/classes"
import { cn } from "@/lib/utils"

/**
 * A box with no meaning: the card colour, a corner radius and padding. Every
 * other box in the kit is built on it, so the three forms are defined once here
 * and nothing downstream drifts.
 *
 * The default form is `plain` — no border and no shadow. There is no
 * `PlainSurface`, because `<Surface>` already is it.
 */
export function Surface({ variant = "plain", asChild = false, className, ...props }: SurfaceProps) {
  /* asChild lets the box become the element it is standing in for — an <a> for
     a card that is entirely a link, an <li> for a row inside a list — instead of
     wrapping one, which is what Card and ListItem are built on. */
  const Component = asChild ? Slot : "div"

  return (
    <Component
      data-slot="surface"
      /* text-text as well as bg-card: a box that paints its own background and
         not its own foreground inherits whatever colour it was dropped into,
         and a Surface inside a primary-tinted region comes out unreadable. */
      className={cn(
        "bg-card text-text rounded-lg p-4",
        classFor(VARIANTS, variant, "Surface's variant"),
        className,
      )}
      {...props}
    />
  )
}

/** A hairline edge. What to reach for when the surface sits flat on the page. */
export function OutlineSurface(props: FormProps) {
  return <Surface variant="outline" {...props} />
}

/**
 * Lifted off the page by a shadow. The shadow colour is keyed to the mode, not
 * to how light the page is, so in a palette with a dark light-mode page it is
 * nearly invisible — which is why the card colour separates it too, and the
 * shadow is a second signal rather than the only one.
 */
export function RaisedSurface(props: FormProps) {
  return <Surface variant="raised" {...props} />
}

type SurfaceProps = ComponentProps<"div"> & {
  /** `outline`, not `outlined` — shadcn's word, so the word typed from habit. */
  variant?: Variant
  /** Render the single child as the box, rather than wrapping it in a div. */
  asChild?: boolean
}

/** The wrappers pick the variant, so no caller can pass a second one. */
type FormProps = Omit<SurfaceProps, "variant">

type Variant = keyof typeof VARIANTS

const VARIANTS = {
  plain: "",
  outline: "border-border border",
  raised: "shadow-xs",
} as const
